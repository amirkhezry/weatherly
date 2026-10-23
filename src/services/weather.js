
export async function getCityCoordinates(cityName) {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search` +
    `?name=${encodeURIComponent(cityName)}` +
    `&count=1&language=en&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("جست‌وجوی شهر ناموفق بود.");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("شهر موردنظر پیدا نشد.");
  }

  return data.results[0];
}

export async function getWeatherForecast(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m` +
    `&hourly=temperature_2m,weather_code,is_day,precipitation_probability` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&forecast_days=7&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("دریافت اطلاعات آب‌وهوا ناموفق بود.");
  }

  return response.json();
}

export async function getCityCurrentWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,is_day,weather_code` +
    `&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("دریافت اطلاعات شهر ناموفق بود.");
  }

  const data = await response.json();

  return data.current;
}
