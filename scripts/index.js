"use strict";

const express = require('express');
const http = require('http');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const expressApp = express();
const server = http.createServer(expressApp);
const port = 8080;

// Check if running on Raspberry Pi
const isRaspberryPi = fs.existsSync('/proc/cpuinfo') && 
                      fs.readFileSync('/proc/cpuinfo', 'utf8').includes('Raspberry Pi');

// Only load DHT sensor module on Raspberry Pi
let dhtSensor = null;
if (isRaspberryPi) {
    dhtSensor = require('node-dht-sensor');
    dhtSensor.initialize(11, 13);
}

// Serve static files from public directory
expressApp.use(express.static(path.join(__dirname, '../')));

// Add root route to serve menu.html
expressApp.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    transform: rotate(-90deg);
                    transform-origin: left top;
                    width: 100vh;
                    height: 100vw;
                    position: absolute;
                    top: 100%;
                    left: 0;
                }
                iframe {
                    border: 0;
                    width: 100%;
                    height: 100%;
                }
            </style>
        </head>
        <body>
            <iframe src="/menu.html"></iframe>
        </body>
        </html>
    `);
});

// Conditionally add DHT routes
if (isRaspberryPi) {
    expressApp.get('/dht_temp', async (req, res) => {
        dhtSensor.read(11, 13, (err, temp, hum) => {
            if (err) {
                res.status(500).send('Erro na leitura do sensor');
                return;
            }
            res.send(`Temperatura interna: ${temp.toFixed(1)}°C`);
        });
    });

    expressApp.get('/dht_humidity', async (req, res) => {
        dhtSensor.read(11, 13, (err, temp, hum) => {
            if (err) {
                res.status(500).send('Erro na leitura do sensor');
                return;
            }
            res.send(`Umidade interna: ${hum.toFixed(1)}%`);
        });
    });
}

// Add OS check endpoint
expressApp.get('/check-os', (req, res) => {
    res.json({ isRaspberryPi });
});

// Start HTTP server and open browser
server.listen(port, '0.0.0.0', () => {
    console.log(`Servidor iniciado com sucesso na porta ${port}`);
    // Use xdg-open for Linux systems
    exec(`xdg-open http://localhost:${port}/`);
});


