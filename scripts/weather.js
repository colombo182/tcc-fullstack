const API_KEY = '6c69e08fb45939e6ebc0cb6e9c8c317a';

async function updateWeather() {
    const city = localStorage.getItem('localizacao');
    if (!city) return;

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const weatherInfo = document.getElementById('weather-info');
        
        if (weatherInfo) {
            weatherInfo.innerHTML = `
                <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" style="width: 85px; height: 85px; margin-top: 25px; margin-left: 25px;">
                <div style="text-align: right">
                    <strong>${city}</strong><br>
                    Temperatura: ${data.main.temp.toFixed(1)}°C<br>
                    Umidade: ${data.main.humidity}%<br>
                    Sensação térmica: ${data.main.feels_like.toFixed(1)}°C<br>
                    Máxima: ${data.main.temp_max.toFixed(1)}°C<br>
                    Mínima: ${data.main.temp_min.toFixed(1)}°C
                </div>
            `;
        }
        return data;
    } catch (error) {
        console.error('Error fetching weather:', error);
        setTimeout(updateWeather, 900000); // 15 minutes retry
        return null;
    }
}

module.exports = { updateWeather };
