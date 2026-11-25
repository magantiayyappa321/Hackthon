
import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate
} from "react-router-dom";

import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Droplets,
  Wind,
  Eye,
  Search,
  MapPin,
  ThermometerSun,
  Sunrise,
  Sunset,
  ShieldAlert,
  LogOut,
  LayoutDashboard,
  Users,
  Plus,
  Trash2,
  CloudDrizzle
} from "lucide-react";

import Login from "./pages/Login";
import Signup from "./pages/signup";

const API = "https://api.open-meteo.com/v1/forecast";

function getWeather(code) {
  if (code === 0) return { label: "Clear Sky", icon: Sun };
  if ([1, 2].includes(code)) return { label: "Partly Cloudy", icon: CloudSun };
  if (code === 3) return { label: "Overcast", icon: Cloud };
  if ([45, 48].includes(code)) return { label: "Foggy", icon: CloudFog };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
    return { label: "Rainy", icon: CloudRain };
  if ([95, 96, 99].includes(code))
    return { label: "Thunderstorm", icon: CloudLightning };
  return { label: "Cloudy", icon: Cloud };
}

function UserDashboard({ account }) {
  const [city, setCity] = useState("Hyderabad");
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState([]);

  async function loadWeather(cityName) {
    if (!cityName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );

      if (!geoResponse.ok) throw new Error("Location search failed");

      const geoData = await geoResponse.json();
      const place = geoData.results?.[0];

      if (!place) throw new Error("City not found. Try another city.");

      const weatherResponse = await fetch(
        `${API}?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=5`
      );

      if (!weatherResponse.ok) throw new Error("Weather data unavailable");

      const data = await weatherResponse.json();

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

      setCity(place.name);
    } catch (err) {
      setError(err.message || "Unable to load weather.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWeather("Hyderabad");
    setAlerts(JSON.parse(localStorage.getItem("weather_alerts") || "[]"));
  }, []);

  const condition = weather
    ? getWeather(weather.weather_code)
    : { label: "Weather", icon: CloudSun };

  const WeatherIcon = condition.icon;

  const hourly = weather
    ? forecast.length
      ? Array.from({ length: 6 }, (_, index) => {
          const currentHour = new Date().getHours();
          const timeIndex = Math.min(currentHour + index, 23);
          return {
            time: index === 0 ? "Now" : `${timeIndex}:00`,
            temp: weather.temperature_2m + (index % 2 === 0 ? 0 : -1 + index)
          };
        })
      : []
    : [];

  return (
    <main className="weather-app">
      <header className="topbar">
        <Link to="/" className="brand">
          <CloudSun size={30} />
          <span>Sky<span>Sense</span></span>
        </Link>

        <div className="topbar-right">
          <span className="user-label">Welcome, {account.name}</span>
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem("weather_logged_in");
            window.location.href = "/login";
          }}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </header>

      <section className="weather-container">
        <div className="welcome-row">
          <div>
            <p className="eyebrow">SMART WEATHER INTELLIGENCE</p>
            <h1>Weather Dashboard</h1>
            <p className="muted">Stay informed. Stay prepared.</p>
          </div>

          <form className="search-box" onSubmit={(e) => {
            e.preventDefault();
            loadWeather(search);
          }}>
            <Search size={19} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city..."
            />
            <button type="submit">Search</button>
          </form>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <div className="loading-message">Loading live weather...</div>}

        {weather && !loading && (
          <>
            <section className="hero-weather">
              <div className="hero-left">
                <div className="location">
                  <MapPin size={17} />
                  {weather.place}, {weather.country}
                </div>

                <div className="temperature">
                  {Math.round(weather.temperature_2m)}°
                  <span>C</span>
                </div>

                <h2>{condition.label}</h2>
                <p className="feels-like">
                  Feels like {Math.round(weather.apparent_temperature)}°C
                </p>
              </div>

              <div className="hero-icon">
                <WeatherIcon size={125} strokeWidth={1.2} />
              </div>

              <div className="hero-footer">
                <span>Current weather</span>
                <span>Updated: {new Date(weather.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}</span>
              </div>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <Droplets />
                <p>Humidity</p>
                <h3>{weather.relative_humidity_2m}%</h3>
              </div>

              <div className="stat-card">
                <Wind />
                <p>Wind Speed</p>
                <h3>{weather.wind_speed_10m} <small>km/h</small></h3>
              </div>

              <div className="stat-card">
                <ThermometerSun />
                <p>Feels Like</p>
                <h3>{Math.round(weather.apparent_temperature)}°C</h3>
              </div>

              <div className="stat-card">
                <CloudDrizzle />
                <p>Precipitation</p>
                <h3>{weather.precipitation} <small>mm</small></h3>
              </div>
            </section>

            <section className="content-grid">
              <div className="panel forecast-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">WEATHER OUTLOOK</p>
                    <h2>5-Day Forecast</h2>
                  </div>
                  <CloudSun size={25} />
                </div>

                <div className="forecast-list">
                  {forecast.map((day, index) => {
                    const DayIcon = getWeather(day.code).icon;

                    return (
                      <div className="forecast-row" key={day.date}>
                        <span>{index === 0 ? "Today" : new Date(day.date).toLocaleDateString("en", { weekday: "short" })}</span>
                        <DayIcon size={23} />
                        <span className="forecast-condition">
                          {getWeather(day.code).label}
                        </span>
                        <strong>{Math.round(day.max)}°</strong>
                        <span className="muted">{Math.round(day.min)}°</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="panel insight-panel">
                <p className="eyebrow">SMART INSIGHTS</p>
                <h2>Weather Tips</h2>

                <div className="tip-item">
                  <Sun size={23} />
                  <div>
                    <strong>Plan your day</strong>
                    <p>Check the forecast before outdoor activities.</p>
                  </div>
                </div>

                <div className="tip-item">
                  <Droplets size={23} />
                  <div>
                    <strong>Stay hydrated</strong>
                    <p>Drink enough water throughout the day.</p>
                  </div>
                </div>

                <div className="tip-item">
                  <CloudRain size={23} />
                  <div>
                    <strong>Be prepared</strong>
                    <p>Check rain conditions before travelling.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel alerts-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">STAY SAFE</p>
                  <h2>Weather Alerts & Announcements</h2>
                </div>
                <ShieldAlert size={27} />
              </div>

              {alerts.length === 0 ? (
                <p className="muted">No new announcements from the admin.</p>
              ) : (
                <div className="alert-list">
                  {alerts.map((alert) => (
                    <div className="alert-item" key={alert.id}>
                      <ShieldAlert size={22} />
                      <div>
                        <strong>{alert.title}</strong>
                        <p>{alert.type} · {alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function AdminDashboard({ account }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("Weather Alert");
  const [alerts, setAlerts] = useState(
    JSON.parse(localStorage.getItem("weather_alerts") || "[]")
  );

  function addAlert(e) {
    e.preventDefault();

    const updated = [
      ...alerts,
      { id: Date.now(), title, message, type }
    ];

    setAlerts(updated);
    localStorage.setItem("weather_alerts", JSON.stringify(updated));
    setTitle("");
    setMessage("");
  }

  function deleteAlert(id) {
    const updated = alerts.filter((item) => item.id !== id);
    setAlerts(updated);
    localStorage.setItem("weather_alerts", JSON.stringify(updated));
  }

  return (
    <main className="weather-app">
      <header className="topbar">
        <div className="brand">
          <CloudSun size={30} />
          <span>Sky<span>Sense</span> Admin</span>
        </div>
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem("weather_logged_in");
          window.location.href = "/login";
        }}>
          <LogOut size={17} /> Logout
        </button>
      </header>

      <section className="weather-container">
        <p className="eyebrow">CONTROL CENTER</p>
        <h1>Admin Dashboard</h1>
        <p className="muted">Welcome, {account.name}. Manage weather updates and announcements.</p>

        <div className="stats-grid admin-stats">
          <div className="stat-card">
            <LayoutDashboard />
            <p>Dashboard</p>
            <h3>Active</h3>
          </div>
          <div className="stat-card">
            <ShieldAlert />
            <p>Published Updates</p>
            <h3>{alerts.length}</h3>
          </div>
          <div className="stat-card">
            <Users />
            <p>Admin Role</p>
            <h3>Manager</h3>
          </div>
        </div>

        <section className="content-grid admin-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">PUBLISH CONTENT</p>
                <h2>Add Weather Information</h2>
              </div>
              <Plus size={25} />
            </div>

            <form className="admin-form" onSubmit={addAlert}>
              <label>Information Category</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option>Weather Alert</option>
                <option>Weather Tip</option>
                <option>Announcement</option>
              </select>

              <label>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: Heavy Rain Alert"
                required
              />

              <label>Description</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the weather update..."
                rows="4"
                required
              />

              <button className="primary-btn" type="submit">
                <Plus size={18} /> Publish Update
              </button>
            </form>
          </div>

          <div className="panel">
            <p className="eyebrow">CONTENT MANAGEMENT</p>
            <h2>Published Updates</h2>

            {alerts.length === 0 && (
              <p className="muted">No updates published yet.</p>
            )}

            {alerts.map((item) => (
              <div className="admin-alert" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.type}</p>
                  <p>{item.message}</p>
                </div>
                <button className="delete-btn" onClick={() => deleteAlert(item.id)}>
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function ProtectedDashboard() {
  const account = JSON.parse(
    localStorage.getItem("weather_logged_in") || "null"
  );

  if (!account) return <Navigate to="/login" replace />;

  return account.role === "admin"
    ? <AdminDashboard account={account} />
    : <UserDashboard account={account} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/user" element={<ProtectedDashboard />} />
      <Route path="/admin" element={<ProtectedDashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
