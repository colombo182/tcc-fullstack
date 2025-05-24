export class ExecService {
    static async execute(command) {
        try {
            const response = await fetch('/api/exec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Command execution failed:', error);
            throw error;
        }
    }
}
