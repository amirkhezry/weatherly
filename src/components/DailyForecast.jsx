
function DailyForecast({
  day,
  temperature,
  minTemperature,
  icon,
  label,
}) {
  return (
    <article className="daily-card">
      <div className="daily-day">
        {day}
      </div>

      <span
        className="daily-condition-icon"
        role="img"
        aria-label={label}
      >
        {icon}
      </span>

      <div className="daily-condition">
        {label}
      </div>

      <div className="daily-temperatures">
        <strong>{temperature}°</strong>
        <span>{minTemperature}°</span>
      </div>
    </article>
  );
}

export default DailyForecast;
