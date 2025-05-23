const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const { getDHTReadings } = require('./dht');

function isRaspberryPi() {
    try {
        // Check CPU info instead of device tree
        const cpuInfo = execSync('cat /proc/cpuinfo').toString().toLowerCase();
        return cpuInfo.includes('raspberry') || cpuInfo.includes('bcm');
    } catch (error) {
        console.error('Error checking CPU info:', error);
        return false;
    }
}

function getNetworkAddresses() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    
    for (const iface of Object.values(interfaces)) {
        for (const addr of iface) {
            if (addr.family === 'IPv4' && !addr.internal) {
                addresses.push(addr.address);
            }
        }
    }
    return addresses;
}

try {
    const arch = os.arch();
    console.log(`Running on architecture: ${arch}`);
    
    // Start express server for browser version
    const express = require('express');
    const app = express();
    const port = 3000;
    
    app.use(express.static(path.join(__dirname, '../public')));
    
    // Add clock endpoint
    app.get('/api/clock', (req, res) => {
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        
        let hours24 = now.getHours();
        let hours12 = hours24 % 12 || 12;
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        
        res.json({
            h24: `${pad(hours24)}:${pad(minutes)}:${pad(seconds)}`,
            h12: `${pad(hours12)}:${pad(minutes)}:${pad(seconds)} ${hours24 >= 12 ? 'PM' : 'AM'}`
        });
    });

    app.get('/dht_temp', (req, res) => {
        getDHTReadings()
            .then(({ temperature }) => {
                res.send(`Temperatura interna: ${temperature}°C`);
                console.log(`Temperatura interna: ${temperature}°C`);
            })
            .catch(err => {
                res.send('Temperatura interna: err°C');
                console.error(err);
            });
    });

    app.get('/dht_humidity', (req, res) => {
        getDHTReadings()
            .then(({ humidity }) => {
                res.send(`Umidade interna: ${humidity}%`);
                console.log(`Umidade interna: ${humidity}%`);
            })
            .catch(err => {
                res.send('Umidade interna: err%');
                console.error(err);
            });
    });

    app.listen(port, '0.0.0.0', () => {
        const addresses = getNetworkAddresses();
        console.log('\n=== Network Access Instructions ===');
        console.log('From OTHER computers on the network, use one of these addresses:');
        addresses.forEach((addr, index) => {
            console.log(`Option ${index + 1}: http://${addr}:${port}`);
        });
        console.log('\nFrom THIS computer use:');
        console.log(`http://localhost:${port}`);
        console.log('\nNote: Try the first option if connecting from another device.');
        
        // Only open browser if running locally
        if (isRaspberryPi()) {
            execSync(`xdg-open http://localhost:${port}`);
        }
        
        // Open Electron window with rotation
        const { BrowserWindow, app: electronApp } = require('electron');
        electronApp.whenReady().then(() => {
            const win = new BrowserWindow({
                width: 800,
                height: 1200, // Make window taller to enable scrolling
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false
                },
                frame: false
            });
            win.loadURL(`http://localhost:${port}`);
            
            // Enhanced scrollbar styling
            win.webContents.insertCSS(`
                body {
                    overflow-y: scroll !important;
                    background: #000;
                    color: #fff;
                }
                ::-webkit-scrollbar {
                    width: 16px;
                    background: rgba(0,0,0,0.8);
                }
                ::-webkit-scrollbar-track {
                    background: rgba(255,255,255,0.1);
                    border-radius: 8px;
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.3);
                    border-radius: 8px;
                    border: 2px solid rgba(0,0,0,0.8);
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.5);
                }
            `);
        });
    });
} catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
}
