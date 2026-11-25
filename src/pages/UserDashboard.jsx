
import React from "react";
import { Link } from "react-router-dom";
import { CloudSun, MapPin, Wind, Droplets } from "lucide-react";

export default function UserDashboard() {
  const user = JSON.parse(localStorage.getItem("weatherUser") || "null");

  return (
    <div className="dashboard-page">
      <nav className="top-nav">
        <h3>☀ Weather App</h3>
        <Link to="/login">Logout</Link>
      </nav>
      <main className="dashboard-content">
        <h1>Welcome, {user?.name || "User"}!</h1>
        <p>Your personal weather dashboard</p>
        <div className="weather-grid">
          <div className="weather-tile"><CloudSun size={35}/><h3>Live Weather</h3><p>Check current conditions</p></div>
          <div className="weather-tile"><MapPin size={35}/><h3>City Search</h3><p>Explore weather by location</p></div>
          <div className="weather-tile"><Droplets size={35}/><h3>Humidity</h3><p>Track humidity updates</p></div>
          <div className="weather-tile"><Wind size={35}/><h3>Wind Speed</h3><p>Monitor wind conditions</p></div>
        </div>
        <Link to="/weather" className="auth-button">Open Weather Dashboard</Link>
      </main>
    </div>
  );
}
