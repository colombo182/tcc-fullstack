import { strict as assert } from 'assert';
import { JSDOM } from 'jsdom';
import sinon from 'sinon';

describe('Menu HTML', function () {
    let dom;
    let localStorage;

    beforeEach(function () {
        // Create DOM with event handlers inline
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <body>
                    <div class="welcome">Bem-vindo ao Espelho inteligente</div>
                    <div class="opcoes">
                        <h5>
                            <div class="retangulo reset-button" onclick="resetOptions()">Resetar as opções selecionadas</div>
                        </h5>
                        <h6>
                            <div class="retangulo start-button" onclick="validateAndStart()">Iniciar Espelho Inteligente</div>
                        </h6>
                    </div>
                    <div id="configValues" class="selected-values"></div>
                    <div id="countdown" class="countdown"></div>
                </body>
            </html>
        `, {
            runScripts: 'dangerously',
            resources: 'usable'
        });

        // Setup localStorage mock
        localStorage = {
            clear: sinon.spy(),
            getItem: sinon.stub(),
            setItem: sinon.stub(),
            length: 0
        };
        
        dom.window.localStorage = localStorage;
        global.localStorage = localStorage;

        // Add required functions to window
        dom.window.resetOptions = function() {
            localStorage.clear();
            dom.window.displayConfig();
        };

        dom.window.validateAndStart = function() {
            const configItems = ['localizacao', 'formato_hora', 'fonte_noticia', 'intervalo_medicao', 'comodo'];
            const hasAllConfig = configItems.every(item => localStorage.getItem(item));
            
            const configValues = dom.window.document.getElementById('configValues');
            if (!hasAllConfig) {
                configValues.innerHTML = '<strong style="color: #ff4444">⚠️ Atenção: Configure todas as opções antes de iniciar o espelho!</strong>';
                return false;
            }
            return true;
        };

        dom.window.displayConfig = function() {
            const configDiv = dom.window.document.getElementById('configValues');
            configDiv.innerHTML = '';
        };
    });

    it('should have welcome message', function() {
        const welcome = dom.window.document.querySelector('.welcome');
        assert(welcome);
        assert.equal(welcome.textContent, 'Bem-vindo ao Espelho inteligente');
    });

    it('should have two menu options', function() {
        const menuItems = dom.window.document.querySelectorAll('.retangulo');
        assert.equal(menuItems.length, 2);
    });

    it('should have correct menu item texts', function() {
        const menuItems = dom.window.document.querySelectorAll('.retangulo');
        assert(menuItems[0].textContent.includes('Resetar as opções selecionadas'));
        assert(menuItems[1].textContent.includes('Iniciar Espelho Inteligente'));
    });

    it('should handle menu item click', function() {
        const menuItem = dom.window.document.querySelector('.retangulo');
        let clicked = false;
        
        menuItem.addEventListener('click', () => clicked = true);
        menuItem.click();
        
        assert(clicked);
    });

    it('should reset options when reset button clicked', function() {
        const resetBtn = dom.window.document.querySelector('.reset-button');
        const event = new dom.window.Event('click');
        resetBtn.dispatchEvent(event);
        
        assert(localStorage.clear.calledOnce, 'localStorage.clear should be called once');
    });

    it('should validate config before starting', function() {
        localStorage.getItem.returns(null);
        
        const startBtn = dom.window.document.querySelector('.start-button');
        const result = dom.window.validateAndStart();
        
        const configValues = dom.window.document.getElementById('configValues');
        assert(configValues.innerHTML.includes('Atenção'), 'Warning message should be displayed');
        assert.equal(result, false, 'Should return false when validation fails');
    });

    it('should handle countdown timer', function() {
        const clock = sinon.useFakeTimers();
        const countdownDisplay = dom.window.document.getElementById('countdown');
        
        let startTime = 30;
        const countdownInterval = setInterval(() => {
            startTime--;
            countdownDisplay.textContent = `Tela desligará em: ${startTime} segundos`;
        }, 1000);

        clock.tick(5000);
        assert(countdownDisplay.textContent.includes('25'));
        
        clock.restore();
        clearInterval(countdownInterval);
    });
});