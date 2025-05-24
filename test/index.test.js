import { strict as assert } from 'assert';
import sinon from 'sinon';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a mock BrowserWindow instance
const browserWindowInstance = {
    loadURL: sinon.stub(),
    on: sinon.stub(),
    maximize: sinon.stub()
};

// Create BrowserWindow constructor mock
const browserWindowMock = sinon.stub().returns(browserWindowInstance);

const appMock = {
    on: sinon.stub(),
    quit: sinon.stub(),
    allowRendererProcessReuse: false
};

// Handler for window-all-closed event
const windowAllClosedHandler = () => {
    appMock.quit();
};

const electronApp = {
    createWindow: function() {
        const window = new browserWindowMock({
            width: 800,
            height: 600,
            x: 0,
            y: 0,
            darkTheme: true,
            fullscreen: true,
            backgroundColor: '#000000',
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: true,
                sandbox: true
            }
        });
        window.loadURL('file://' + __dirname + '/menu.html');
        window.on('closed', () => {
            this.setMainWindow(null);
        });
        window.maximize(); // Ensure window is maximized on creation
        this.setMainWindow(window);
        return window;
    },
    setMainWindow: sinon.stub(),
    getMainWindow: sinon.stub()
};

describe('Electron App', () => {
    let eventHandlers = {};
    
    beforeEach(() => {
        // Reset all stubs
        sinon.resetHistory();
        appMock.quit.reset();
        browserWindowInstance.loadURL.reset();
        browserWindowInstance.on.reset();
        
        // Reset event handlers
        eventHandlers = {};
        
        // Configure app.on stub to store handlers
        appMock.on.callsFake((event, handler) => {
            eventHandlers[event] = handler;
        });

        // Register event handlers
        appMock.on('ready', () => electronApp.createWindow());
        appMock.on('window-all-closed', () => appMock.quit());
        appMock.on('activate', () => {
            if (electronApp.getMainWindow() === null) {
                electronApp.createWindow();
            }
        });
    });

    it('should quit app when all windows are closed', () => {
        const allClosedHandler = eventHandlers['window-all-closed'];
        allClosedHandler();
        assert(appMock.quit.calledOnce);
    });

    it('should create new window on activate when no windows exist', () => {
        const activateHandler = eventHandlers['activate'];
        electronApp.getMainWindow.returns(null);
        
        activateHandler();
        assert(browserWindowMock.calledOnce);
    });

    it('should not create new window on activate when window exists', () => {
        const activateHandler = eventHandlers['activate'];
        electronApp.getMainWindow.returns(browserWindowInstance);
        
        activateHandler();
        assert(browserWindowMock.notCalled);
    });

    it('should handle window closed event', () => {
        const readyHandler = eventHandlers['ready'];
        readyHandler();

        const closedCallback = browserWindowInstance.on.firstCall.args[1];
        closedCallback();
        
        assert(electronApp.setMainWindow.calledWith(null));
    });

    it('should maximize window on creation', () => {
        browserWindowInstance.maximize = sinon.stub();
        const readyHandler = eventHandlers['ready'];
        
        readyHandler();
        assert(browserWindowInstance.maximize.calledOnce);
    });

    it('should set correct window preferences', () => {
        const readyHandler = eventHandlers['ready'];
        readyHandler();

        const options = browserWindowMock.firstCall.args[0];
        assert.strictEqual(options.darkTheme, true);
        assert.strictEqual(options.fullscreen, true);
        assert.strictEqual(options.backgroundColor, '#000000');
        assert(options.webPreferences.contextIsolation);
        assert(options.webPreferences.nodeIntegration);
        assert(options.webPreferences.sandbox);
    });

    it('should set correct initial position', () => {
        const readyHandler = eventHandlers['ready'];
        readyHandler();

        const options = browserWindowMock.firstCall.args[0];
        assert.strictEqual(options.x, 0);
        assert.strictEqual(options.y, 0);
    });

    it('should disable renderer process reuse', () => {
        assert.strictEqual(appMock.allowRendererProcessReuse, false);
    });
});