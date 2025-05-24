export class DisplayService {
    static async turnOn() {
        try {
            const response = await fetch('/api/display/on', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to turn display on');
            return true;
        } catch (error) {
            console.error('Display control error:', error);
            return false;
        }
    }

    static async turnOff() {
        try {
            const response = await fetch('/api/display/off', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to turn display off');
            return true;
        } catch (error) {
            console.error('Display control error:', error);
            return false;
        }
    }
}
