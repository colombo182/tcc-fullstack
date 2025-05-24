class CountdownManager {
    constructor(displayElement, displayControl = null) {
        this.displayElement = displayElement;
        this.displayControl = displayControl;
        this.interval = null;
        this.secondsLeft = 30;
    }

    start() {
        this.clear();
        this.secondsLeft = 30;
        this.updateDisplay();
        
        this.interval = setInterval(() => {
            this.secondsLeft--;
            this.updateDisplay();
            
            if (this.secondsLeft <= 0) {
                this.clear();
                if (this.displayControl) {
                    this.displayControl.turnOff();
                }
                this.displayElement.textContent = 'Tela desligada';
            }
        }, 1000);
    }

    reset() {
        this.clear();
        if (this.displayControl) {
            this.displayControl.turnOn();
        }
        this.start();
    }

    clear() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    updateDisplay() {
        this.displayElement.textContent = `Tela desligará em: ${this.secondsLeft} segundos`;
    }
}

module.exports = CountdownManager;
