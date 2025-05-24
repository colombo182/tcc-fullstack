const sensor = require('node-dht-sensor');

// Initialize DHT11 sensor on GPIO13
sensor.initialize(11, 13);

function readSensor() {
    return new Promise((resolve, reject) => {
        sensor.read(11, 13, (err, temperature, humidity) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({ temperature, humidity });
        });
    });
}

module.exports = { readSensor };
