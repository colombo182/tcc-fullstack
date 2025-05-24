const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const axios = require('axios');

port = 8080;

const RSS_URLS = {
    agenciabrasil: 'http://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml',
    google1: 'https://rss.app/feeds/fsGZHkrUNHGzFmsd.xml',
    google2: 'https://rss.app/feeds/ZqLpsjBXCfy4oC33.xml'
};

// Serve static files
app.use(express.static(__dirname));

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.get('/api/proxy/news/:source', async (req, res) => {
    try {
        const url = RSS_URLS[req.params.source];
        if (!url) {
            return res.status(404).send('Feed not found');
        }
        
        const response = await axios.get(url);
        res.set('Content-Type', 'application/xml');
        res.send(response.data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).send('Error fetching feed');
    }
});

// Start server
http.listen(port, () => {
    console.log('Servidor iniciado com sucesso')
    open('http://localhost:' + port + '/')
});
