let countdownInterval;
let secondsLeft = 30;

function startCountdown() {
    clearInterval(countdownInterval);
    secondsLeft = 30;
    const countdownDisplay = document.getElementById('countdown');
    
    countdownInterval = setInterval(() => {
        secondsLeft--;
        countdownDisplay.textContent = `Tela desligará em: ${secondsLeft} segundos`;
        
        if (secondsLeft <= 0) {
            clearInterval(countdownInterval);
            const { exec } = require('child_process');
            exec('bash scripts/display_off.sh', (error) => {
                if (error) console.error('Error executing display_off.sh:', error);
            });
            countdownDisplay.textContent = 'Tela desligada';
        }
    }, 1000);
}

function resetCountdown() {
    clearInterval(countdownInterval);
    secondsLeft = 30;
    const { exec } = require('child_process');
    exec('bash scripts/display_on.sh', (error) => {
        if (error) console.error('Error executing display_on.sh:', error);
    });
    startCountdown();
}

// Initialize countdown and event listeners
function initCountdown() {
    document.addEventListener('mousemove', resetCountdown);
    document.addEventListener('keypress', resetCountdown);
    startCountdown();
}
