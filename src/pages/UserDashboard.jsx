import { useCallback, useEffect, useState } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  Heart,
  MapPin,
  Search,
  Sun,
  ThermometerSun,
  Wind
} from "lucide-react";
import { useOutletContext } from "react-router-dom";

const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

function getWeather(code) {
  if (code === 0) return { label: "Clear sky", icon: Sun };
  if ([1, 2].includes(code)) return { label: "Partly cloudy", icon: CloudSun };
  if (code === 3) return { label: "Overcast", icon: Cloud };
  if ([45, 48].includes(code)) return { label: "Foggy", icon: CloudFog };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return { label: "Rain showers", icon: CloudRain };
  }
  if ([95, 96, 99].includes(code)) {
    return { label: "Thunderstorms", icon: CloudLightning };
  }
  return { label: "Cloudy", icon: Cloud };
}

function formatForecastDate(date, index) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "short"
  });
}

export default function UserDashboard() {
  const { account } = useOutletContext();
  const [city, setCity] = useState("Hyderabad");
  const [search, setSearch] = useState("Hyderabad");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState([]);
  const favoritesKey = `weather_favorites_${account.email}`;
  const [favorites, setFavorites] = useState(() =>
    JSON.parse(localStorage.getItem(favoritesKey) || "[]")
  );

  const loadWeather = useCallback(async (cityName) => {
    if (!cityName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );
      if (!geoResponse.ok) throw new Error("Location search failed.");

      const geoData = await geoResponse.json();
      const place = geoData.results?.[0];
      if (!place) throw new Error("City not found. Try another location.");

      const weatherResponse = await fetch(
        `${WEATHER_API}?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=5`
      );
      if (!weatherResponse.ok) throw new Error("Weather data is unavailable.");

      const data = await weatherResponse.json();
      const currentIndex = data.hourly.time.findIndex(
        (time) => time === data.current.time
      );
      const startIndex = currentIndex >= 0 ? currentIndex : 0;

      setWeather({
        ...data.current,
        place: place.name,
        country: place.country,
        timezone: data.timezone
      });
      setForecast(
        data.daily.time.map((date, index) => ({
          date,
          code: data.daily.weather_code[index],
          max: data.daily.temperature_2m_max[index],
          min: data.daily.temperature_2m_min[index]
        }))
      );
      setHourly(
        data.hourly.time.slice(startIndex, startIndex + 6).map((time, index) => ({
          time: index === 0
            ? "Now"
            : new Date(time).toLocaleTimeString(undefined, {
                hour: "numeric",
                hour12: true
              }),
          temperature: data.hourly.temperature_2m[startIndex + index],
          chance: data.hourly.precipitation_probability[startIndex + index]
        }))
      );
      setCity(place.name);
      setSearch(place.name);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load weather right now."
      );
      setWeather(null);
      setForecast([]);
      setHourly([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather("Hyderabad");
    setAlerts(JSON.parse(localStorage.getItem("weather_alerts") || "[]"));
  }, [loadWeather]);

  function toggleFavorite() {
    if (!weather) return;
    const alreadySaved = favorites.some(
      (favorite) => favorite.name.toLowerCase() === city.toLowerCase()
    );
    const updated = alreadySaved
      ? favorites.filter(
          (favorite) => favorite.name.toLowerCase() !== city.toLowerCase()
        )
      : [...favorites, { name: city, country: weather.country }];

    setFavorites(updated);
    localStorage.setItem(favoritesKey, JSON.stringify(updated));
  }

  const isFavorite = favorites.some(
    (favorite) => favorite.name.toLowerCase() === city.toLowerCase()
  );
  const condition = weather
    ? getWeather(weather.weather_code)
    : { label: "Weather", icon: CloudSun };
  const WeatherIcon = condition.icon;
  const tips = [];

  if (weather?.precipitation > 0) {
    tips.push({
      icon: CloudDrizzle,
      title: "Keep rain gear close",
      text: "Rain is currently reported nearby, so take an umbrella if you head out."
    });
  }
  if (weather?.relative_humidity_2m >= 70) {
    tips.push({
      icon: Droplets,
      title: "Humidity is high",
      text: "Choose breathable layers and take it easy during outdoor activity."
    });
  }
  if (weather?.wind_speed_10m >= 25) {
    tips.push({
      icon: Wind,
      title: "A breezy day",
      text: "Secure loose outdoor items and allow extra time when cycling."
    });
  }
  if (tips.length === 0) {
    tips.push({
      icon: Sun,
      title: "Make the most of the day",
      text: "Check the hourly outlook before planning time outside."
    });
  }

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <p className="eyebrow">LOCAL CONDITIONS</p>
          <h1>Your weather dashboard</h1>
          <p className="subheading">Live conditions and a little more confidence in your day.</p>
        </div>
        <form
          className="weather-search"
          onSubmit={(event) => {
            event.preventDefault();
            loadWeather(search);
          }}
        >
          <Search size={19} aria-hidden="true" />
          <input
            aria-label="Search a city"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search any city"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </section>

      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {loading && <div className="notice notice-loading">Refreshing the forecast...</div>}

      {weather && !loading && (
        <>
          <section className="hero-weather">
            <div className="hero-orbit" aria-hidden="true" />
            <div className="hero-copy">
              <span className="live-tag"><span /> CURRENT WEATHER</span>
              <div className="hero-location"><MapPin size={17} /> {weather.place}, {weather.country}</div>
              <div className="hero-temperature">
                {Math.round(weather.temperature_2m)}<span>°</span>
              </div>
              <h2>{condition.label}</h2>
              <p>Feels like {Math.round(weather.apparent_temperature)}° · H:{Math.round(forecast[0]?.max ?? weather.temperature_2m)}° L:{Math.round(forecast[0]?.min ?? weather.temperature_2m)}°</p>
            </div>
            <div className="hero-weather-icon" aria-hidden="true">
              <WeatherIcon size={126} strokeWidth={1.3} />
            </div>
            <button
              className={`favorite-toggle${isFavorite ? " selected" : ""}`}
              type="button"
              onClick={toggleFavorite}
              aria-label={isFavorite ? "Remove city from favorites" : "Add city to favorites"}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <div className="hero-meta">
              <span>Updated {new Date(weather.time).toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit"
              })}</span>
              <span>{weather.is_day ? "Daytime" : "Nighttime"} conditions</span>
            </div>
          </section>

          <section className="weather-stats" aria-label="Current weather details">
            <article className="weather-stat">
              <span className="stat-icon cyan"><Droplets size={20} /></span>
              <div><p>Humidity</p><strong>{weather.relative_humidity_2m}%</strong></div>
            </article>
            <article className="weather-stat">
              <span className="stat-icon blue"><Wind size={20} /></span>
              <div><p>Wind speed</p><strong>{weather.wind_speed_10m} <small>km/h</small></strong></div>
            </article>
            <article className="weather-stat">
              <span className="stat-icon amber"><ThermometerSun size={20} /></span>
              <div><p>Feels like</p><strong>{Math.round(weather.apparent_temperature)}°</strong></div>
            </article>
          </section>

          <section className="panel-card hourly-panel" id="forecast">
            <div className="section-heading">
              <div><p className="eyebrow">THE NEXT FEW HOURS</p><h2>Hourly forecast</h2></div>
              <span className="section-caption">Temperature · Rain chance</span>
            </div>
            <div className="hourly-list">
              {hourly.map((hour, index) => (
                <div className="hourly-item" key={`${hour.time}-${index}`}>
                  <span>{hour.time}</span>
                  <CloudSun size={23} />
                  <strong>{Math.round(hour.temperature)}°</strong>
                  <small><Droplets size={12} /> {hour.chance ?? 0}%</small>
                </div>
              ))}
            </div>
          </section>

          <div className="dashboard-columns">
            <section className="panel-card forecast-panel">
              <div className="section-heading">
                <div><p className="eyebrow">PLAN AHEAD</p><h2>5-day forecast</h2></div>
                <CloudSun className="heading-icon" size={23} />
              </div>
              <div className="daily-forecast">
                {forecast.map((day, index) => {
                  const DayIcon = getWeather(day.code).icon;
                  return (
                    <div className="daily-row" key={day.date}>
                      <span className="daily-day">{formatForecastDate(day.date, index)}</span>
                      <DayIcon size={23} />
                      <span className="daily-condition">{getWeather(day.code).label}</span>
                      <strong>{Math.round(day.max)}°</strong>
                      <span className="daily-low">{Math.round(day.min)}°</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="panel-card favorites-panel" id="favorites">
              <div className="section-heading">
                <div><p className="eyebrow">YOUR PLACES</p><h2>Favorite cities</h2></div>
                <Heart className="heading-icon" size={21} />
              </div>
              {favorites.length === 0 ? (
                <p className="empty-copy">Save a city with the heart on its weather card for quick access here.</p>
              ) : (
                <div className="favorite-list">
                  {favorites.map((favorite) => (
                    <div className="favorite-row" key={`${favorite.name}-${favorite.country}`}>
                      <button type="button" onClick={() => loadWeather(favorite.name)}>
                        <MapPin size={16} />
                        <span><strong>{favorite.name}</strong><small>{favorite.country}</small></span>
                      </button>
                      <button
                        className="remove-favorite"
                        type="button"
                        onClick={() => {
                          const updated = favorites.filter(
                            (item) => item.name !== favorite.name
                          );
                          setFavorites(updated);
                          localStorage.setItem(favoritesKey, JSON.stringify(updated));
                        }}
                        aria-label={`Remove ${favorite.name} from favorites`}
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="dashboard-columns lower-columns">
            <section className="panel-card" id="alerts">
              <div className="section-heading">
                <div><p className="eyebrow">STAY PREPARED</p><h2>Weather alerts</h2></div>
                <span className="heading-icon"><Cloud size={22} /></span>
              </div>
              {alerts.length === 0 ? (
                <p className="empty-copy">No weather alerts or announcements right now. You’re all caught up.</p>
              ) : (
                <div className="alert-list">
                  {alerts.map((alert) => (
                    <article className="weather-alert" key={alert.id}>
                      <span className="alert-mark"><Bell size={17} /></span>
                      <div>
                        <div className="alert-title-row">
                          <strong>{alert.title}</strong>
                          <span>{alert.type}</span>
                        </div>
                        <p>{alert.message}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="panel-card tips-panel">
              <div className="section-heading">
                <div><p className="eyebrow">A LITTLE WEATHER WISDOM</p><h2>Today’s tips</h2></div>
                <Sun className="heading-icon" size={22} />
              </div>
              <div className="tip-list">
                {tips.map(({ icon: TipIcon, title, text }) => (
                  <article className="weather-tip" key={title}>
                    <span><TipIcon size={19} /></span>
                    <div><strong>{title}</strong><p>{text}</p></div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
