
import { useEffect, useRef, useState } from "react";
import "./App.css";

import HourlyForecast from "./components/HourlyForecast";

import {
  getCityCoordinates,
  getWeatherForecast,
  getCityCurrentWeather,
} from "./services/weather";

// Safely read preferences from localStorage.
function readPreference(key, fallback) {
  try {
    if (typeof window === "undefined") return fallback;
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

// Safely save preferences to localStorage.
function writePreference(key, value) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // The app remains usable if browser storage is unavailable.
  }
}

// City recommendations grouped by country code.
const COUNTRY_CITIES = {
  AZ: ["Baku", "Ganja", "Sumqayit", "Lankaran", "Mingachevir", "Shaki", "Nakhchivan"],
  IR: ["Tehran", "Mashhad", "Isfahan", "Tabriz", "Shiraz", "Urmia", "Rasht", "Kerman", "Yazd", "Kermanshah"],
  DE: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Dusseldorf", "Dortmund"],
  NL: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen", "Maastricht"],
  GB: ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Bristol", "Edinburgh", "Glasgow"],
  US: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Seattle", "Boston", "Miami"],
  JP: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Sapporo", "Fukuoka", "Hiroshima", "Nagoya"],
  FR: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Bordeaux", "Lille", "Nantes"],
  TR: ["Istanbul", "Ankara", "Izmir", "Antalya", "Bursa", "Konya", "Adana", "Gaziantep"],
  CA: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Quebec City", "Edmonton", "Winnipeg"],
  AU: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Gold Coast"],
  IT: ["Rome", "Milan", "Naples", "Florence", "Venice", "Turin", "Bologna", "Palermo"],
  ES: ["Madrid", "Barcelona", "Valencia", "Seville", "Malaga", "Zaragoza", "Bilbao", "Alicante"],
  IN: ["New Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Jaipur", "Pune"],
  PK: ["Karachi", "Lahore", "Islamabad", "Peshawar", "Faisalabad", "Quetta", "Multan"],
  AE: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Al Ain", "Fujairah"],
  SA: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Tabuk", "Taif"],
  BR: ["Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador", "Recife", "Curitiba", "Fortaleza"],
  RU: ["Moscow", "Saint Petersburg", "Kazan", "Sochi", "Novosibirsk", "Yekaterinburg"],
  CN: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Wuhan", "Hangzhou"],
  CH: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Lucerne"],
  BE: ["Brussels", "Antwerp", "Ghent", "Bruges", "Liege", "Leuven"],
  SE: ["Stockholm", "Gothenburg", "Malmo", "Uppsala", "Vasteras"],
  NO: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromso"],
  DK: ["Copenhagen", "Aarhus", "Odense", "Aalborg"],
  AT: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck"],
  PL: ["Warsaw", "Krakow", "Wroclaw", "Gdansk", "Poznan", "Lodz"],
  CZ: ["Prague", "Brno", "Ostrava", "Plzen"],
  GR: ["Athens", "Thessaloniki", "Patras", "Heraklion"],
  MX: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Cancun", "Tijuana"],
  ZA: ["Johannesburg", "Cape Town", "Durban", "Pretoria"],
  EG: ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan"],
  NZ: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Dunedin"],
  KR: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju"],
  GE: ["Tbilisi", "Batumi", "Kutaisi", "Rustavi", "Zugdidi"],
  AM: ["Yerevan", "Gyumri", "Vanadzor", "Vagharshapat"],
  UA: ["Kyiv", "Lviv", "Odesa", "Kharkiv", "Dnipro", "Vinnytsia"],
  PT: ["Lisbon", "Porto", "Braga", "Coimbra", "Faro"],
  IE: ["Dublin", "Cork", "Galway", "Limerick", "Waterford"],
  ID: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang"],
  TH: ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Khon Kaen"],
  MY: ["Kuala Lumpur", "George Town", "Johor Bahru", "Ipoh", "Kuching"],
  SG: ["Singapore"],
};

const TEXT = {
  fa: {
    search: "جست‌وجو",
    placeholder: "نام شهر را وارد کنید...",
    location: "موقعیت انتخاب‌شده",
    week: "پیش‌بینی ۷ روز آینده",
    rain: "احتمال بارش",
    hourly: "پیش‌بینی ساعتی",
    cities: "شهرهای همین کشور",
    today: "امروز",
    clear: "آسمان صاف",
    partly: "کمی ابری",
    cloudy: "ابری",
    fog: "مه‌آلود",
    drizzle: "نم‌نم باران",
    rainy: "بارانی",
    snowy: "برفی",
    storm: "طوفان تندری",
    unknown: "وضعیت نامشخص",
    day: "روز",
    night: "شب",
    feels: "دمای احساسی",
    humidity: "رطوبت",
    wind: "سرعت باد",
    welcome: "آب‌وهوا در یک نگاه",
    welcomeText: "نام یک شهر را وارد کنید تا وضعیت فعلی و پیش‌بینی آن را ببینید.",
    loading: "در حال دریافت اطلاعات...",
    loadingCities: "در حال پیدا کردن شهرهای این کشور...",
    error: "دریافت اطلاعات آب‌وهوا ناموفق بود.",
    notFound: "شهر موردنظر پیدا نشد.",
    noCities: "برای این کشور هنوز فهرست شهرهای پیشنهادی تعریف نشده است.",
    themeDay: "روز",
    themeNight: "شب",
    automatic: "خودکار",
    source: "داده‌های هواشناسی: Open-Meteo",
    localTime: "زمان محلی",
    quickSearch: "شروع سریع",
  },
  en: {
    search: "Search",
    placeholder: "Enter a city name...",
    location: "Selected location",
    week: "7-day forecast",
    rain: "Chance of rain",
    hourly: "Hourly forecast",
    cities: "Cities in this country",
    today: "Today",
    clear: "Clear sky",
    partly: "Partly cloudy",
    cloudy: "Cloudy",
    fog: "Foggy",
    drizzle: "Drizzle",
    rainy: "Rainy",
    snowy: "Snowy",
    storm: "Thunderstorm",
    unknown: "Unknown",
    day: "DAY",
    night: "NIGHT",
    feels: "Feels like",
    humidity: "Humidity",
    wind: "Wind speed",
    welcome: "Weather at a glance",
    welcomeText: "Enter a city to see its current weather and forecast.",
    loading: "Fetching weather data...",
    loadingCities: "Finding cities in this country...",
    error: "Unable to retrieve weather data.",
    notFound: "City not found.",
    noCities: "City suggestions are not configured for this country yet.",
    themeDay: "Day",
    themeNight: "Night",
    automatic: "Auto",
    source: "Weather data: Open-Meteo",
    localTime: "Local time",
    quickSearch: "Get started",
  },
};

function normalizeName(value = "") {
  return value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getWeatherInfo(code, isDay, language) {
  const t = TEXT[language];

  if (code === 0) {
    return { label: t.clear, icon: isDay ? "☀️" : "🌙" };
  }

  if ([1, 2].includes(code)) {
    return { label: t.partly, icon: isDay ? "🌤️" : "☁️" };
  }

  if (code === 3) {
    return { label: t.cloudy, icon: "☁️" };
  }

  if ([45, 48].includes(code)) {
    return { label: t.fog, icon: "🌫️" };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return { label: t.drizzle, icon: "🌦️" };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { label: t.rainy, icon: "🌧️" };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { label: t.snowy, icon: "❄️" };
  }

  if ([95, 96, 99].includes(code)) {
    return { label: t.storm, icon: "⛈️" };
  }

  return { label: t.unknown, icon: isDay ? "🌤️" : "🌙" };
}

function formatDay(date, language, isToday) {
  if (isToday) return TEXT[language].today;

  return new Intl.DateTimeFormat(
    language === "fa" ? "fa-IR" : "en-US",
    { weekday: "short" }
  ).format(new Date(`${date}T12:00:00`));
}

// Find recommendations only in the selected city's country.
async function getCitiesFromSameCountry(selectedPlace) {
  const countryCode = selectedPlace.country_code?.toUpperCase();
  const cityNames = COUNTRY_CITIES[countryCode];

  if (!cityNames || cityNames.length === 0) {
    return [];
  }

  const selectedName = normalizeName(selectedPlace.name);

  const searchNames = cityNames.filter(
    (name) => normalizeName(name) !== selectedName
  );

  const coordinateResults = await Promise.allSettled(
    searchNames.map((name) => getCityCoordinates(name))
  );

  const matchedPlaces = [];
  const seenNames = new Set([selectedName]);

  for (const result of coordinateResults) {
    if (result.status !== "fulfilled") continue;

    const place = result.value;

    if (place.country_code?.toUpperCase() !== countryCode) continue;

    const normalized = normalizeName(place.name);

    if (seenNames.has(normalized)) continue;

    seenNames.add(normalized);
    matchedPlaces.push(place);
  }

  const placesToShow = matchedPlaces.slice(0, 4);

  const weatherResults = await Promise.allSettled(
    placesToShow.map((place) =>
      getCityCurrentWeather(place.latitude, place.longitude)
    )
  );

  return placesToShow
    .map((place, index) => {
      const result = weatherResults[index];

      if (result.status !== "fulfilled") return null;

      return {
        id: `${place.country_code}-${place.latitude}-${place.longitude}`,
        name: place.name,
        country: place.country,
        place,
        weather: result.value,
      };
    })
    .filter(Boolean);
}

function App() {
  // Restore the last successfully searched city from localStorage.
  const [city, setCity] = useState(() =>
    readPreference("weatherly:lastCity", "")
  );

  const [cityData, setCityData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [otherCities, setOtherCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState("");

  // Restore the previous language.
  const [language, setLanguage] = useState(() => {
    const savedLanguage = readPreference(
      "weatherly:language",
      "fa"
    );

    return savedLanguage === "en" ? "en" : "fa";
  });

  // null = automatic, true = night, false = day.
  const [themeOverride, setThemeOverride] = useState(() => {
    const savedTheme = readPreference(
      "weatherly:theme",
      "auto"
    );

    if (savedTheme === "night") return true;
    if (savedTheme === "day") return false;

    return null;
  });

  const requestNumber = useRef(0);

  const t = TEXT[language];
  const isEnglish = language === "en";

  const current = forecast?.current;
  const hourly = forecast?.hourly;
  const daily = forecast?.daily;

  const actualNight = current
    ? Number(current.is_day) === 0
    : false;

  const isNight =
    themeOverride === null ? actualNight : themeOverride;

  const currentInfo = current
    ? getWeatherInfo(
        current.weather_code,
        Number(current.is_day) === 1,
        language
      )
    : null;

  async function searchCity(
    event,
    cityOverride = city,
    placeOverride = null
  ) {
    event?.preventDefault();

    const query = String(cityOverride ?? "").trim();

    if (!query) {
      setError(
        language === "fa"
          ? "لطفاً نام شهر را وارد کنید."
          : "Please enter a city name."
      );
      return;
    }

    const thisRequest = ++requestNumber.current;

    setLoading(true);
    setError("");
    setOtherCities([]);
    setLoadingCities(false);

    try {
      const place =
        placeOverride || await getCityCoordinates(query);

      const data = await getWeatherForecast(
        place.latitude,
        place.longitude
      );

      // Ignore results from an older search.
      if (thisRequest !== requestNumber.current) return;

      setCityData(place);
      setForecast(data);
      setCity(place.name);

      // Save the city only after a successful weather request.
      writePreference("weatherly:lastCity", place.name);

      // Fetch recommendations from the same country.
      setLoadingCities(true);

      getCitiesFromSameCountry(place)
        .then((cities) => {
          if (thisRequest === requestNumber.current) {
            setOtherCities(cities);
          }
        })
        .catch(() => {
          if (thisRequest === requestNumber.current) {
            setOtherCities([]);
          }
        })
        .finally(() => {
          if (thisRequest === requestNumber.current) {
            setLoadingCities(false);
          }
        });
    } catch (err) {
      if (thisRequest === requestNumber.current) {
        setCityData(null);
        setForecast(null);
        setOtherCities([]);

        const notFound = err.message?.includes("پیدا نشد");

        setError(notFound ? t.notFound : t.error);
      }
    } finally {
      if (thisRequest === requestNumber.current) {
        setLoading(false);
      }
    }
  }

  // Restore the previous city once when the app starts.
  useEffect(() => {
    const savedCity = readPreference(
      "weatherly:lastCity",
      ""
    );

    if (savedCity.trim()) {
      searchCity(null, savedCity);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist language changes.
  useEffect(() => {
    writePreference("weatherly:language", language);
  }, [language]);

  // Persist theme selection, including automatic mode.
  useEffect(() => {
    const savedTheme =
      themeOverride === null
        ? "auto"
        : themeOverride
          ? "night"
          : "day";

    writePreference("weatherly:theme", savedTheme);
  }, [themeOverride]);

  let firstHourIndex = 0;

  if (hourly?.time?.length && current?.time) {
    const currentHour = current.time.slice(0, 13);

    const foundIndex = hourly.time.findIndex(
      (time) => time.slice(0, 13) === currentHour
    );

    firstHourIndex = foundIndex >= 0 ? foundIndex : 0;
  }

  const hourlyItems = hourly
    ? hourly.time
        .slice(firstHourIndex, firstHourIndex + 6)
        .map((time, index) => {
          const i = firstHourIndex + index;
          const isDay = Number(hourly.is_day[i]) === 1;

          const info = getWeatherInfo(
            hourly.weather_code[i],
            isDay,
            language
          );

          return {
            time: time.slice(11, 16),
            temperature: Math.round(hourly.temperature_2m[i]),
            icon: info.icon,
            label: info.label,
          };
        })
    : [];

  const dailyItems = daily
    ? daily.time.map((date, index) => {
        const info = getWeatherInfo(
          daily.weather_code[index],
          true,
          language
        );

        return {
          date,
          day: formatDay(date, language, index === 0),
          temperature: Math.round(
            daily.temperature_2m_max[index]
          ),
          minTemperature: Math.round(
            daily.temperature_2m_min[index]
          ),
          icon: info.icon,
          label: info.label,
        };
      })
    : [];

  const rainItems = hourly
    ? hourly.time
        .slice(firstHourIndex, firstHourIndex + 6)
        .map((time, index) => {
          const i = firstHourIndex + index;

          return {
            time: time.slice(11, 16),
            probability: Math.round(
              hourly.precipitation_probability?.[i] ?? 0
            ),
          };
        })
    : [];

  const localTime = current?.time
    ? current.time.slice(11, 16)
    : "--:--";

  function handleCityCardClick(item) {
    setCity(item.name);
    setThemeOverride(null);
    searchCity(null, item.name, item.place);
  }

  return (
    <div
      className={`app-shell ${isNight ? "night" : "day"}`}
      dir={isEnglish ? "ltr" : "rtl"}
      lang={language}
    >
      <main className="weather-dashboard">
        <header className="topbar">
          <a
            className="brand"
            href="#"
            onClick={(event) => event.preventDefault()}
          >
            <span className="brand-mark">☼</span>
            <span>Weatherly</span>
          </a>

          <div className="header-location">
            <span>⌖</span>
            <span>
              {cityData
                ? `${cityData.name}, ${cityData.country}`
                : t.location}
            </span>
          </div>

          <form
            className="search-form"
            onSubmit={(event) => searchCity(event)}
          >
            <span className="search-icon">⌕</span>

            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              type="search"
              placeholder={t.placeholder}
              aria-label={t.placeholder}
            />

            <button type="submit" disabled={loading}>
              {loading ? "..." : t.search}
            </button>
          </form>

          <div className="header-actions">
            <button
              className="icon-button"
              type="button"
              title={t.themeDay}
              aria-label={t.themeDay}
              onClick={() => setThemeOverride(false)}
            >
              ☀
            </button>

            <button
              className="icon-button"
              type="button"
              title={t.themeNight}
              aria-label={t.themeNight}
              onClick={() => setThemeOverride(true)}
            >
              ☾
            </button>

            <button
              className="control-button"
              type="button"
              onClick={() => setThemeOverride(null)}
              title={t.automatic}
            >
              {t.automatic}
            </button>

            <button
              className="control-button language-button"
              type="button"
              onClick={() =>
                setLanguage((previous) =>
                  previous === "fa" ? "en" : "fa"
                )
              }
            >
              {isEnglish ? "فارسی" : "English"}
            </button>
          </div>
        </header>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading-message">
            <span className="spinner" />
            {t.loading}
          </div>
        )}

        {cityData && current && !loading && (
          <section className="current-weather-panel">
            <div className="current-weather-heading">
              <div>
                <p className="eyebrow">{t.location}</p>

                <h1>
                  {cityData.name}
                  {cityData.country
                    ? `, ${cityData.country}`
                    : ""}
                </h1>

                <p className="current-local-time">
                  {t.localTime}: {current.time?.slice(11, 16)}
                </p>
              </div>

              <span
                className={`current-day-night ${
                  Number(current.is_day) === 1
                    ? "is-day"
                    : "is-night"
                }`}
              >
                {Number(current.is_day) === 1
                  ? `☀ ${t.day}`
                  : `☾ ${t.night}`}
              </span>
            </div>

            <div className="current-weather-main">
              <div className="current-weather-icon" role="img">
                {currentInfo.icon}
              </div>

              <div className="current-temperature">
                <strong>
                  {Math.round(current.temperature_2m)}
                </strong>

                <span className="temperature-unit">C</span>
                <span className="degree-symbol">°</span>
              </div>

              <div className="current-weather-description">
                <h2>{currentInfo.label}</h2>

                <p>
                  {t.feels}:{" "}
                  {Math.round(current.apparent_temperature)}°C
                </p>
              </div>
            </div>

            <div className="current-weather-details">
              <div className="current-detail-item">
                <span>💧</span>
                <small>{t.humidity}</small>
                <strong>{current.relative_humidity_2m}%</strong>
              </div>

              <div className="current-detail-item">
                <span>💨</span>
                <small>{t.wind}</small>
                <strong>
                  {Math.round(current.wind_speed_10m)} km/h
                </strong>
              </div>

              <div className="current-detail-item">
                <span>🌧️</span>
                <small>{t.rain}</small>
                <strong>{current.precipitation} mm</strong>
              </div>
            </div>
          </section>
        )}

        {cityData && current && !loading ? (
          <>
            <section className="dashboard-top">
              <div className="weekly-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{t.location}</p>
                    <h1>{t.week}</h1>
                  </div>

                  <span className="current-local-time">
                    {t.localTime}: {localTime}
                  </span>
                </div>

                <div className="week-grid">
                  {dailyItems.map((item, index) => (
                    <article
                      key={item.date}
                      className={`week-card ${
                        index === 0 ? "week-card-today" : ""
                      }`}
                    >
                      <span className="week-day">{item.day}</span>

                      <span
                        className="week-icon"
                        role="img"
                        aria-label={item.label}
                      >
                        {item.icon}
                      </span>

                      <strong className="week-max">
                        {item.temperature}°
                      </strong>

                      <span className="week-min">
                        {item.minTemperature}°
                      </span>

                      {index === 0 && (
                        <span className="today-condition">
                          {currentInfo.icon} {currentInfo.label}
                        </span>
                      )}
                    </article>
                  ))}
                </div>
              </div>

              <section className="rain-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{t.today}</p>
                    <h2>{t.rain}</h2>
                  </div>

                  <span className="section-symbol">☂</span>
                </div>

                <div className="rain-chart">
                  <div className="rain-axis">
                    <span>100%</span>
                    <span>50%</span>
                    <span>0%</span>
                  </div>

                  <div className="rain-bars">
                    {rainItems.map((item) => (
                      <div
                        className="rain-bar-column"
                        key={item.time}
                        title={`${item.probability}%`}
                      >
                        <span className="rain-percent">
                          {item.probability}%
                        </span>

                        <div className="rain-bar-track">
                          <div
                            className="rain-bar"
                            style={{
                              height: `${Math.max(
                                item.probability,
                                3
                              )}%`,
                            }}
                          />
                        </div>

                        <span className="rain-time">
                          {item.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </section>

            <section className="dashboard-bottom">
              <div className="hourly-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{t.today}</p>
                    <h2>{t.hourly}</h2>
                  </div>

                  <span className="section-symbol">◷</span>
                </div>

                <div className="hourly-grid">
                  {hourlyItems.map((item) => (
                    <HourlyForecast
                      key={item.time}
                      {...item}
                    />
                  ))}
                </div>

                <div className="current-detail-grid">
                  <div className="detail-tile">
                    <span>🌡️</span>
                    <small>{t.feels}</small>
                    <strong>
                      {Math.round(current.apparent_temperature)}°C
                    </strong>
                  </div>

                  <div className="detail-tile">
                    <span>💧</span>
                    <small>{t.humidity}</small>
                    <strong>
                      {current.relative_humidity_2m}%
                    </strong>
                  </div>

                  <div className="detail-tile">
                    <span>💨</span>
                    <small>{t.wind}</small>
                    <strong>
                      {Math.round(current.wind_speed_10m)} km/h
                    </strong>
                  </div>
                </div>
              </div>

              <section className="other-cities-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{t.location}</p>
                    <h2>{t.cities}</h2>
                  </div>

                  <span className="section-symbol">⌖</span>
                </div>

                <div className="other-cities-list">
                  {otherCities.map((item) => {
                    const cityIsDay =
                      Number(item.weather.is_day) === 1;

                    const info = getWeatherInfo(
                      item.weather.weather_code,
                      cityIsDay,
                      language
                    );

                    return (
                      <article
                        key={item.id}
                        className="other-city-card"
                        role="button"
                        tabIndex={0}
                        aria-label={`Show weather for ${item.name}`}
                        onClick={() =>
                          handleCityCardClick(item)
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            event.preventDefault();
                            handleCityCardClick(item);
                          }
                        }}
                      >
                        <div className="other-city-info">
                          <span className="other-city-country">
                            {item.country}
                          </span>

                          <h3>{item.name}</h3>

                          <p>{info.label}</p>

                          <span
                            className={`day-night-badge ${
                              cityIsDay ? "is-day" : "is-night"
                            }`}
                          >
                            {cityIsDay
                              ? "☀ " + t.day
                              : "☾ " + t.night}
                          </span>
                        </div>

                        <div className="other-city-weather">
                          <span
                            className="other-city-icon"
                            role="img"
                            aria-label={info.label}
                          >
                            {info.icon}
                          </span>

                          <strong>
                            {Math.round(
                              item.weather.temperature_2m
                            )}°
                          </strong>
                        </div>
                      </article>
                    );
                  })}

                  {loadingCities && (
                    <p className="empty-cities">
                      {t.loadingCities}
                    </p>
                  )}

                  {!loadingCities && otherCities.length === 0 && (
                    <p className="empty-cities">
                      {t.noCities}
                    </p>
                  )}
                </div>
              </section>
            </section>
          </>
        ) : !loading && !error ? (
          <section className="welcome-panel glass-panel">
            <span className="welcome-icon">🌤️</span>
            <h2>{t.welcome}</h2>
            <p>{t.welcomeText}</p>

            <div className="popular-cities">
              {["Baku", "Tehran", "Berlin", "Tokyo"].map(
                (name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setCity(name);
                      searchCity(null, name);
                    }}
                  >
                    {name} ↗
                  </button>
                )
              )}
            </div>
          </section>
        ) : null}

        <footer className="app-footer">
          <span>Weatherly</span>
          <span>{t.source}</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
