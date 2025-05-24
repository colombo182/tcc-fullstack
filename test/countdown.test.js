import { strict as assert } from 'assert';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';

const CountdownManager = (await import('../scripts/countdown.js')).default;

describe('Countdown', () => {
    let dom;
    let clock;
    let countdownDisplay;
    let displayControl;
    let countdownManager;

    beforeEach(() => {
        dom = new JSDOM(`
            <!DOCTYPE html>
            <body>
                <div id="countdown" class="countdown"></div>
            </body>
        `);

        global.window = dom.window;
        global.document = dom.window.document;
        clock = sinon.useFakeTimers();
        countdownDisplay = document.getElementById('countdown');
        displayControl = {
            turnOff: sinon.stub(),
            turnOn: sinon.stub()
        };
        countdownManager = new CountdownManager(countdownDisplay, displayControl);
    });

    afterEach(() => {
        clock.restore();
        countdownManager.clear();
    });

    it('should start countdown from 30 seconds', () => {
        countdownManager.start();
        assert.equal(countdownDisplay.textContent, 'Tela desligará em: 30 segundos');
    });

    it('should update countdown every second', () => {
        countdownManager.start();
        clock.tick(5000);
        assert.equal(countdownDisplay.textContent, 'Tela desligará em: 25 segundos');
    });

    it('should display message when countdown reaches zero', () => {
        countdownManager.start();
        clock.tick(30000);
        assert.equal(countdownDisplay.textContent, 'Tela desligada');
        assert(displayControl.turnOff.calledOnce);
    });

    it('should reset countdown on user interaction', () => {
        countdownManager.start();
        clock.tick(10000);
        countdownManager.reset();
        assert.equal(countdownDisplay.textContent, 'Tela desligará em: 30 segundos');
        assert(displayControl.turnOn.calledOnce);
    });
});
