// ── Config ─────────────────────────────────────────────────────────────────
const API_KEY = '04c8d6981d0b6f39037a157d023f59f4'; // Your OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// ── DOM References ──────────────────────────────────────────────────────────
const form         = document.getElementById('weather-form');
const cityInput    = document.getElementById('city');
const errorMsg     = document.getElementById('error-msg');
const searchBtn    = document.getElementById('search-btn');
const searchCard   = document.getElementById('search-card');
const weatherCard  = document.getElementById('weather-card');
const searchAgain  = document.getElementById('search-again-btn');

// Weather result elements
const elCityName    = document.getElementById('city-name');
const elCityDate    = document.getElementById('city-date');
const elWeatherIcon = document.getElementById('weather-icon');
const elTemp        = document.getElementById('temp-value');
const elCondition   = document.getElementById('condition-label');
const elHumidity    = document.getElementById('humidity');
const elWind        = document.getElementById('wind');
const elVisibility  = document.getElementById('visibility');
const elFeelsLike   = document.getElementById('feels-like');
const elTempMin     = document.getElementById('temp-min');
const elTempMax     = document.getElementById('temp-max');

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Format current date as "Monday, 13 May 2024" */
function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  });
}

/** Round to 1 decimal */
function round1(n) {
  return Math.round(n * 10) / 10;
}

/** Set loading state on the button */
function setLoading(isLoading) {
  if (isLoading) {
    searchBtn.classList.add('loading');
    searchBtn.disabled = true;
  } else {
    searchBtn.classList.remove('loading');
    searchBtn.disabled = false;
  }
}

/** Show an error message */
function showError(msg) {
  errorMsg.textContent = msg;
}

/** Clear error */
function clearError() {
  errorMsg.textContent = '';
}

// ── Populate Weather Card ────────────────────────────────────────────────────
function populateWeather(data) {
  const { name, sys, main, weather, wind, visibility } = data;

  // Location & date
  elCityName.textContent = `${name}, ${sys.country}`;
  elCityDate.textContent = formatDate();

  // Icon (OpenWeatherMap icon CDN)
  const iconCode = weather[0].icon;
  elWeatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  elWeatherIcon.alt = weather[0].description;

  // Temperature & condition
  elTemp.textContent      = round1(main.temp);
  elCondition.textContent = weather[0].description;

  // Stats
  elHumidity.textContent  = main.humidity + '%';
  elWind.textContent      = round1(wind.speed) + ' m/s';
  elVisibility.textContent = visibility
    ? (visibility / 1000).toFixed(1) + ' km'
    : 'N/A';
  elFeelsLike.textContent = round1(main.feels_like) + '°C';
  elTempMin.textContent   = round1(main.temp_min) + '°C';
  elTempMax.textContent   = round1(main.temp_max) + '°C';
}

// ── Fetch Weather ────────────────────────────────────────────────────────────
async function fetchWeather(city) {
  clearError();
  setLoading(true);

  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const res  = await fetch(url);

    if (res.status === 404) throw new Error('City not found. Please check the spelling.');
    if (res.status === 401) throw new Error('Invalid API key. Please update it in script.js.');
    if (!res.ok)             throw new Error('Something went wrong. Please try again.');

    const data = await res.json();

    populateWeather(data);

    // Show weather card, hide search card
    searchCard.style.display  = 'none';
    weatherCard.style.display = 'block';

  } catch (err) {
    showError('⚠ ' + err.message);
  } finally {
    setLoading(false);
  }
}

// ── Event Listeners ──────────────────────────────────────────────────────────

// Form submit
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    showError('⚠ Please enter a city name.');
    return;
  }
  fetchWeather(city);
});

// Clear error on typing
cityInput.addEventListener('input', clearError);

// "Search Another City" button
searchAgain.addEventListener('click', () => {
  weatherCard.style.display = 'none';
  searchCard.style.display  = 'block';
  cityInput.value = '';
  cityInput.focus();
});