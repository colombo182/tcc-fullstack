export class ClockService {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.fallbackMode = false;
    }

    async start() {
        try {
            await this.updateClock();
            setInterval(() => this.updateClock(), 1000);
        } catch (error) {
            console.error('Clock initialization failed:', error);
            this.useFallbackClock();
        }
    }

    async updateClock() {
        try {
            const now = new Date();
            this.element.textContent = now.toLocaleTimeString();
        } catch (error) {
            if (!this.fallbackMode) {
                this.useFallbackClock();
            }
        }
    }

    useFallbackClock() {
        this.fallbackMode = true;
        setInterval(() => {
            const now = new Date();
            this.element.textContent = now.toLocaleTimeString();
        }, 1000);
    }
}
