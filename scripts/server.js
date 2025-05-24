/* MagicMirror²
 * Server
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 */
const express = require("express");
const app = require("express")();
const path = require("path");
const ipfilter = require("express-ipfilter").IpFilter;
const fs = require("fs");
const helmet = require("helmet");
const fetch = require("node-fetch");

const Log = require("logger");
//const Utils = require("./utils.js");
const NewsService = require('./newsService');

/**
 * Server
 *
 * @param {object} config The MM config
 * @param {Function} callback Function called when done.
 * @class
 */
function Server(config, callback) {
	const port = process.env.MM_PORT || config.port;
	const serverSockets = new Set();

	let server = null;
	if (config.useHttps) {
		const options = {
			key: fs.readFileSync(config.httpsPrivateKey),
			cert: fs.readFileSync(config.httpsCertificate)
		};
		server = require("https").Server(options, app);
	} else {
		server = require("http").Server(app);
	}
	const io = require("socket.io")(server, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
			credentials: true,
			transports: ['websocket', 'polling']
		},
		allowEIO3: true,
		pingTimeout: 60000,
		path: '/socket.io/'
	});

	// Enable CORS for Socket.IO endpoints
	app.use((req, res, next) => {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		next();
	});

	// Initialize PIR control
	const pirControl = require('./pir_control');
	pirControl.checkDisplay();

	// Initialize PIR sensor
	const pirSensor = require('./pir_sensor');
	pirSensor.checkMotion();

	global.io = io; // Make io globally available

	// Add socket button handlers
	io.on('connection', (socket) => {
		let pressed = 0;
		
		socket.on('button1_pressed', () => {
			pressed = 1;
			console.log(pressed);
			setTimeout(() => {
				io.emit('chat message', '1 pressed');
				io.emit('page_message', 'Configurando clima e tempo...');
			}, 100);
		});

		socket.on('button2_pressed', () => {
			pressed = 1;
			console.log(pressed);
			setTimeout(() => {
				io.emit('chat message', '2 pressed');
			}, 100);
		});

		socket.on('button3_pressed', () => {
			pressed = 1;
			console.log(pressed);
			setTimeout(() => {
				io.emit('chat message', '3 pressed');
			}, 100);
		});

		socket.on('button4_pressed', () => {
			pressed = 1;
			console.log(pressed);
			setTimeout(() => {
				io.emit('chat message', '4 pressed');
			}, 100);
		});

		socket.on('start_pressed', () => {
			pressed = 1;
			console.log(pressed);
			setTimeout(() => {
				io.emit('chat message', 'start pressed');
			}, 100);
		});
	});

	server.on("connection", (socket) => {
		serverSockets.add(socket);
		socket.on("close", () => {
			serverSockets.delete(socket);
		});
	});

	Log.log(`Starting server on port ${port} ... `);

	server.listen(port, config.address || "localhost");

	if (config.ipWhitelist instanceof Array && config.ipWhitelist.length === 0) {
//		Log.warn(Utils.colors.warn("You're using a full whitelist configuration to allow for all IPs"));
	}

	app.use(function (req, res, next) {
		ipfilter(config.ipWhitelist, { mode: config.ipWhitelist.length === 0 ? "deny" : "allow", log: false })(req, res, function (err) {
			if (err === undefined) {
				res.header("Access-Control-Allow-Origin", "*");
				return next();
			}
			Log.log(err.message);
			res.status(403).send("This device is not allowed to access your mirror. <br> Please check your config.js or config.js.sample to change this.");
		});
	});
	app.use(helmet(config.httpHeaders));

	app.use("/js", express.static(__dirname));

	const directories = ["/config", "/css", "/fonts", "/modules", "/vendor", "/translations", "/tests/configs"];
	for (const directory of directories) {
		app.use(directory, express.static(path.resolve(global.root_path + directory)));
	}

	app.get("/cors", async function (req, res) {
		// example: http://localhost:8080/cors?url=https://google.de

		try {
			const reg = "^/cors.+url=(.*)";
			let url = "";

			let match = new RegExp(reg, "g").exec(req.url);
			if (!match) {
				url = "invalid url: " + req.url;
				Log.error(url);
				res.send(url);
			} else {
				url = match[1];
				Log.log("cors url: " + url);
				const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 MagicMirror/" + global.version } });
				const header = response.headers.get("Content-Type");
				const data = await response.text();
				if (header) res.set("Content-Type", header);
				res.send(data);
			}
		} catch (error) {
			Log.error(error);
			res.send(error);
		}
	});

	app.get("/version", function (req, res) {
		res.send(global.version);
	});

	app.get("/config", function (req, res) {
		res.send(config);
	});

	app.get("/", function (req, res) {
		let html = fs.readFileSync(path.resolve(`${global.root_path}/menu.html`), { encoding: "utf8" });
		html = html.replace("#VERSION#", global.version);

		let configFile = "config/config.js";
		if (typeof global.configuration_file !== "undefined") {
			configFile = global.configuration_file;
		}
		html = html.replace("#CONFIG_FILE#", configFile);

		res.send(html);
	});

	// News API endpoints
	app.get('/api/news/agenciabrasil', async (req, res) => {
		try {
			const news = await NewsService.getAgenciaBrasilNews();
			if (!news.length) {
				throw new Error('No news available');
			}
			res.json(news);
		} catch (error) {
			res.status(503).json({ error: 'Serviço temporariamente indisponível' });
		}
	});

	app.get('/api/news/google1', async (req, res) => {
		try {
			const news = await NewsService.getGoogleNews('tecnologia');
			if (!news.length) {
				throw new Error('No news available');
			}
			res.json(news);
		} catch (error) {
			res.status(503).json({ error: 'Serviço temporariamente indisponível' });
		}
	});

	app.get('/api/news/google2', async (req, res) => {
		try {
			const news = await NewsService.getGoogleNews('ciência');
			if (!news.length) {
				throw new Error('No news available');
			}
			res.json(news);
		} catch (error) {
			res.status(503).json({ error: 'Serviço temporariamente indisponível' });
		}
	});

	// RSS proxy endpoints
	app.get('/proxy/rss/:source', async (req, res) => {
		try {
			const source = req.params.source;
			const data = await NewsService.fetchRSS(source);
			
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Content-Type', 'application/xml');
			res.send(data);
		} catch (error) {
			console.error('RSS proxy error:', error);
			res.status(503).json({ error: 'Failed to fetch RSS feed' });
		}
	});

	// Add CORS proxy endpoint
	app.get('/api/rss-proxy', async (req, res) => {
		const url = req.query.url;
		if (!url) {
			return res.status(400).json({ error: 'URL parameter is required' });
		}

		try {
			const response = await fetch(url, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.text();
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Content-Type', 'application/xml');
			res.send(data);
		} catch (error) {
			console.error('RSS proxy error:', error);
			res.status(503).json({ error: 'Failed to fetch RSS feed' });
		}
	});

	if (typeof callback === "function") {
		callback(app, io);
	}

	this.close = function () {
		for (const socket of serverSockets.values()) {
			socket.destroy();
		}
		server.close();
	};
}

module.exports = Server;
