import sunny from "./images/sunny.jpg";
import partlyCloudy from "./images/partly-cloudy.jpg";
import rainy from "./images/rainy.jpg";
import overcast from "./images/overcast.jpg";

const weatherContainer = document.getElementById("weather-container");
weatherContainer.style.display = "none";

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

const error = document.getElementById("error");
error.style.display = "none";

const cityName = document.getElementById("city-name");
const weatherName = document.getElementById("weather-name");

const weatherIcon = document.getElementById("weather-icon");

const tempContainer = document.getElementById("temp");

const feelsLikeContainer = document.getElementById("feels-like");
const windSpeedContainer = document.getElementById("wind");
const humidityContainer = document.getElementById("humidity");

const loader = document.getElementById("loader");
loader.style.display = "none";

searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    error.style.display = "none";
    loader.style.display = "block";
    getWeather();
});

async function getGeoCode(location) {
    try {
        const geoCodeResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=412cb66b3bfe6302cf627132aaa75ecc`, {mode: "cors"});
        const geoCodeData = await geoCodeResponse.json();
        const geoCode = geoCodeData[0];
        return geoCode;
    } catch (err) {
        loader.style.display = "none";
        console.log(err);
        error.display.style = "block";
    }
}

function getGeoCoords(geoCode) {
    const lat = geoCode.lat;
    const lon = geoCode.lon;
    return [lat, lon];
}

async function getWeatherData(coords) {
    const lat = coords[0];
    const lon = coords[1];
    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=412cb66b3bfe6302cf627132aaa75ecc`, {mode: "cors"});
        const weatherData = await weatherResponse.json();
        return weatherData;
    } catch (err) {
        loader.style.display = "none";
        console.log(err);
        error.display.style = "block";
    }
}

function chooseBg(weather) {
    const content = document.getElementById("content");
    const header = document.getElementById("header");
    if (weather.includes("partly")) {
        content.style.backgroundImage = `url(${partlyCloudy})`;
        header.style.backgroundImage = `url(${partlyCloudy})`;
    } else if (weather.includes("sun") || weather.includes("clear")) {
        content.style.backgroundImage = `url(${sunny})`;
        header.style.backgroundImage = `url(${sunny})`;
    } else if (weather.includes("cloud")) {
        content.style.backgroundImage = `url(${overcast})`;
        header.style.backgroundImage = `url(${overcast})`;
    } else {
        content.style.backgroundImage = `url(${rainy})`;
        header.style.backgroundImage = `url(${rainy})`;
    }
}

function chooseWeatherIcon(weather) {
    const classNames = weatherIcon.className.split(" ");
    classNames.forEach(name => {
        if (name !== "fa-solid") {
            weatherIcon.classList.remove(name);
        }
    });
    if (weather.includes("partly")) {
        weatherIcon.classList.add("fa-cloud-sun");
    } else if (weather.includes("sun") || (weather.includes("clear"))) {
        weatherIcon.classList.add("fa-sun");
    } else if (weather.includes("cloud")) {
        weatherIcon.classList.add("fa-cloud");
    } else {
        weatherIcon.classList.add("fa-cloud-rain");
    }
}

function kelvinToCelsius(kelv) {
    const cels = -Math.round(-(kelv - 273.15));
    return cels;
}

function celsify(temp) {
    return `${temp}\u00B0C`;
}

function msToKmh(ms) {
    let kmh = ms * 3.6;
    kmh = kmh.toFixed(2);
    return kmh;
}

function displayWeather(data) {
    const cityNameStr = `${data.name}, ${data.sys.country}`;

    cityName.innerText = cityNameStr;

    const rawFeelsLike = data.main.feels_like;
    const celsiusFeelsLike = kelvinToCelsius(rawFeelsLike);
    const feelsLike = celsify(celsiusFeelsLike);

    const humidity = data.main.humidity;

    const rawTemp = data.main.temp;
    const celsiusTemp = kelvinToCelsius(rawTemp);
    const temp = celsify(celsiusTemp); 

    const rawWindSpeed = data.wind.speed; 
    const windSpeed = msToKmh(rawWindSpeed);

    const weather = data.weather[0];
    const weatherStr = weather.description;

    chooseBg(weatherStr);
    chooseWeatherIcon(weatherStr);

    const weatherStrWords = weatherStr.split(" "); 
    weatherName.innerText = `${weatherStrWords[0].charAt(0).toUpperCase() + weatherStrWords[0].substring(1)} 
                            ${weatherStrWords[1].charAt(0).toUpperCase() + weatherStrWords[1].substring(1)}`;

    feelsLikeContainer.innerText = feelsLike;
    tempContainer.innerText = temp;
    humidityContainer.innerText = `${humidity}%`;
    windSpeedContainer.innerText = `${windSpeed}km/h`;

    weatherContainer.style.display = "block";
}

function getWeather() {
    const location = searchInput.value;
    const geoCodePromise = getGeoCode(location);

    geoCodePromise.then((geoCode) => {
        const geoCoords = getGeoCoords(geoCode);
        const weatherDataPromise = getWeatherData(geoCoords);
        weatherDataPromise.then((weatherData) => {
            loader.style.display = "none";
            displayWeather(weatherData);
        }).catch((err) => {
            loader.style.display = "none";
            console.log(err);
            error.style.display = "block";
        });
    }).catch((err) => {
        loader.style.display = "none";
        console.log(err);
        error.style.display = "block";
    });
}