import { strict as assert } from 'assert';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { updateWeather } = require('../scripts/weather.js');

describe('Weather', () => {
    let dom;
    let fetchStub;

    beforeEach(() => {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <body>
                <div id="weather-info"></div>
            </body>
        `);

        global.window = dom.window;
        global.document = dom.window.document;
        global.fetch = fetchStub = sinon.stub();
        global.localStorage = {
            getItem: sinon.stub().returns('São Paulo')
        };
    });

    it('should fetch weather data with correct API key', async () => {
        const mockWeatherData = {
            weather: [{ icon: '01d' }],
            main: {
                temp: 25,
                humidity: 60,
                feels_like: 26,
                temp_max: 28,
                temp_min: 22
            }
        };

        fetchStub.resolves({
            ok: true,
            json: () => Promise.resolve(mockWeatherData)
        });

        await updateWeather();

        assert(fetchStub.calledWith(sinon.match(/appid=6c69e08fb45939e6ebc0cb6e9c8c317a/)));
    });

    it('should update UI with weather data', async () => {
        const mockWeatherData = {
            weather: [{ icon: '01d' }],
            main: {
                temp: 25,
                humidity: 60,
                feels_like: 26,
                temp_max: 28,
                temp_min: 22
            }
        };

        fetchStub.resolves({
            ok: true,
            json: () => Promise.resolve(mockWeatherData)
        });

        await updateWeather();

        const weatherInfo = document.getElementById('weather-info');
        assert(weatherInfo.innerHTML.includes('25.0°C'));
        assert(weatherInfo.innerHTML.includes('60%'));
    });
});
