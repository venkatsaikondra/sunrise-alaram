const btn = document.getElementById('get-location-button');
const alarmDisplay = document.getElementById('Alarm-display');
const locationDisplay = document.getElementById('location');
const currentTimeDisplay = document.getElementById('current-time');
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    currentTimeDisplay.textContent = `Current Time: ${timeString}`;
}
setInterval(updateCurrentTime, 1000);
async function getData(lat, long) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=1713ef255569688028d70eb8f6b44250&units=metric&lang=en`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        locationDisplay.innerHTML = `<p>Failed to fetch weather data. Please try again later.</p>`;
    }
}

async function gotLocation(position) {
    const lat = position.coords.latitude;
    const long = position.coords.longitude;
    locationDisplay.innerHTML = `<p>Fetching weather for your location...</p>`;
    const result = await getData(lat, long);
    if (result) {
        locationDisplay.innerHTML = `
            <h2>Weather Information</h2>
            <p>Location: ${result.name}</p>
            <p>Latitude: ${lat}</p>
            <p>Longitude: ${long}</p>
            <p>Temperature: ${result.main.temp}°C</p>
            <p>Weather: ${result.weather[0].description}</p>
            <p>Humidity: ${result.main.humidity}%</p>
            <img src="${getWeatherImage(result.main.temp)}" alt="Weather Image" style="width:200px;"/>
        `;
    }
}

function failedToGetLocation() {
    locationDisplay.innerHTML = `<p>Failed to retrieve your location. Please ensure location services are enabled.</p>`;
    console.error('There was an issue with getting location.');
}

btn.addEventListener('click', () => {
    locationDisplay.innerHTML = `<p>Getting your location...</p>`;
    navigator.geolocation.getCurrentPosition(gotLocation, failedToGetLocation);
});

async function getSunriseTime(lat, long) {
    const data = await getData(lat, long);
    return data?.sys.sunrise;
}

function convertUnixToLocal(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleTimeString();
}

async function handleLocation(position) {
    const lat = position.coords.latitude;
    const long = position.coords.longitude;
    const sunriseUnix = await getSunriseTime(lat, long);
    if (!sunriseUnix) {
        alarmDisplay.innerHTML = `<p>Could not fetch sunrise time.</p>`;
        return;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    let timeUntilSunrise = (sunriseUnix - currentTime) * 1000;

    let alarmDate = new Date();
    if (timeUntilSunrise <= 0) {
        alarmDate.setDate(alarmDate.getDate() + 1);
        const tomorrowSunrise = new Date(alarmDate);
        tomorrowSunrise.setHours(6, 0, 0); 
        timeUntilSunrise = tomorrowSunrise.getTime() - Date.now();
        alarmDisplay.innerHTML = `<p>Sunrise has already occurred today. Setting alarm for tomorrow.</p>`;
    } else {
        alarmDisplay.innerHTML = `<p>Sunrise is at: ${convertUnixToLocal(sunriseUnix)}</p>`;
    }
    setAlarm(timeUntilSunrise);
}

function setAlarm(timeUntilSunrise) {
    if (timeUntilSunrise > 0) {
        alarmDisplay.innerHTML += `<p>Alarm set for sunrise!</p>`;
        setTimeout(() => {
            playAlarm();
        }, timeUntilSunrise);
    } else {
        alarmDisplay.innerHTML += `<p>Sunrise has already occurred today.</p>`;
    }
}

function playAlarm() {
    const audio = new Audio('/Users/kpvarma/Downloads/mixkit-rooster-crowing-in-the-morning-2462.wav'); 
    audio.play();
    alarmDisplay.innerHTML += `<p>Wake up! It's sunrise!</p>`;
}

function getWeatherImage(temp) {
    if (temp < 0) {
        return '/Users/kpvarma/Downloads/snow.png'; 
    } else if (temp >= 0 && temp < 15) {
        return '/Users/kpvarma/Downloads/cold.jpeg'; 
    } else if (temp >= 15 && temp < 30) {
        return '/Users/kpvarma/Downloads/hotsunny.jpeg'; 
    } else {
        return '/Users/kpvarma/Downloads/hotsunny.jpeg'; 
    }
}

btn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(handleLocation, failedToGetLocation);
});
