
function HourlyForecast({ time, temperature, icon, label }) {
  return (
    <article className="hourly-card">
      <p className="hourly-time">{time}</p>

      <span
        className="forecast-icon"
        role="img"
        aria-label={label}
      >
        {icon}
      </span>

      <p className="hourly-temperature">
        {temperature}°
      </p>

      <p className="forecast-label">
        {label}
      </p>
    </article>
  );
}

export default HourlyForecast;
