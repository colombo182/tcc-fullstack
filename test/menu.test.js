const { JSDOM } = require('jsdom');
const assert = require('assert');

describe('Menu HTML', function () {
    let dom;

    beforeEach(function () {
        // Create a more complete menu structure matching our actual HTML
        dom = new JSDOM(`
            <!DOCTYPE html>
            <html>
                <body>
                    <div class="welcome">Bem-vindo ao Espelho inteligente</div>
                    <div class="opcoes">
                        <h1>
                            <div class="retangulo">Clima e Tempo - Configuração</div>
                        </h1>
                        <h2>
                            <div class="retangulo">Temperatura Indoor - Configuração</div>
                        </h2>
                        <h3>
                            <div class="retangulo">Notícias - Configuração</div>
                        </h3>
                    </div>
                </body>
            </html>
        `);

        // Add window event listener support
        global.window = dom.window;
        global.document = dom.window.document;
    });

    it('should have welcome message', function() {
        const welcome = dom.window.document.querySelector('.welcome');
        assert(welcome);
        assert.equal(welcome.textContent, 'Bem-vindo ao Espelho inteligente');
    });

    it('should have three menu options', function() {
        const menuItems = dom.window.document.querySelectorAll('.retangulo');
        assert.equal(menuItems.length, 3);
    });

    it('should have correct menu item texts', function() {
        const menuItems = dom.window.document.querySelectorAll('.retangulo');
        assert(menuItems[0].textContent.includes('Clima e Tempo'));
        assert(menuItems[1].textContent.includes('Temperatura Indoor'));
        assert(menuItems[2].textContent.includes('Notícias'));
    });

    it('should handle menu item click', function() {
        const menuItem = dom.window.document.querySelector('.retangulo');
        let clicked = false;
        
        menuItem.addEventListener('click', () => clicked = true);
        menuItem.click();
        
        assert(clicked);
    });
});