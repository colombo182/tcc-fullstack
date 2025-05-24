const express = require("express");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const fetch = require("node-fetch");
const ipfilter = require("express-ipfilter").IpFilter;
const Log = require("logger");
const NewsService = require('./newsService');

const app = express();

function Server(config, done) {
	const port = process.env.PORT || config.port;
	const useHttps = config.useHttps;
	let server;

	if (useHttps) {
		const https = require("https");
		const opts = {
			key: fs.readFileSync(config.httpsPrivateKey),
			cert: fs.readFileSync(config.httpsCertificate)
		};
		server = https.createServer(opts, app);
	} else {
		server = require("http").createServer(app);
	}

	const io = require("socket.io")(server, {
		cors: { origin: "*", methods: ["GET", "POST"] },
		allowEIO3: true,
		pingTimeout: 60000,
		path: '/socket.io/'
	});
	global.io = io;

	require('./pir_control').checkDisplay();
	require('./pir_sensor').checkMotion();

	io.on("connection", (socket) => {
		socket.on("button1_pressed", () => {
			io.emit("chat message", "1 pressed");
			io.emit("page_message", "Clima e tempo configurando...");
		});
		// other buttons similar...
	});

	server.listen(port, config.address || "localhost", () => {
		Log.log(`Server running on port ${port}`);
	});

	app.use((req, res, next) => {
		ipfilter(config.ipWhitelist, {
			mode: config.ipWhitelist.length ? "allow" : "deny",
			log: false
		})(req, res, (err) => {
			if (err) {
				Log.log("IP blocked: " + err.message);
				return res.status(403).send("Blocked");
			}
			next();
		});
	});

	app.use(helmet(config.httpHeaders));
	app.use("/js", express.static(__dirname));

	["/config", "/css", "/fonts", "/modules", "/vendor", "/translations", "/tests/configs"].forEach(dir => {
		app.use(dir, express.static(path.resolve(global.root_path + dir)));
	});

	app.get("/version", (req, res) => res.send(global.version));
	app.get("/config", (req, res) => res.send(config));

	app.get("/", (req, res) => {
		let html = fs.readFileSync(path.join(global.root_path, "menu.html"), "utf8");
		html = html.replace("#VERSION#", global.version);
		const configFile = global.configuration_file || "config/config.js";
		res.send(html.replace("#CONFIG_FILE#", configFile));
	});

	app.get("/cors", async (req, res) => {
		const match = /url=(.+)/.exec(req.url);
		if (!match) return res.send("Invalid URL");

		const url = match[1];
		try {
			const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
			res.set("Content-Type", response.headers.get("Content-Type") || "text/plain");
			res.send(await response.text());
		} catch (err) {
			Log.error("CORS error:", err);
			res.send(err.toString());
		}
	});

	app.get('/api/news/agenciabrasil', async (req, res) => {
		try {
			const news = await NewsService.getAgenciaBrasilNews();
			if (!news.length) return res.status(503).json({ error: "Nada de novo agora." });
			res.json(news);
		} catch (e) {
			res.status(503).json({ error: "Erro ao buscar notícias." });
		}
	});

	app.get('/proxy/rss/:source', async (req, res) => {
		try {
			const xml = await NewsService.fetchRSS(req.params.source);
			res.setHeader("Content-Type", "application/xml");
			res.send(xml);
		} catch (e) {
			console.log("Proxy RSS fail:", e);
			res.status(503).send("Feed não disponível.");
		}
	});

	if (typeof done === "function") done(app, io);

	this.close = () => server.close();
}

module.exports = Server;
