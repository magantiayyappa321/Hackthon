
function AdminDashboard({ account }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("Weather Alert");
  const [season, setSeason] = useState("All Seasons");

  const [alerts, setAlerts] = useState(
    JSON.parse(localStorage.getItem("weather_alerts") || "[]")
  );

  function addInformation(e) {
    e.preventDefault();

    const newItem = {
      id: Date.now(),
      title,
      message,
      type,
      season,
      date: new Date().toLocaleDateString()
    };

    const updated = [...alerts, newItem];

    setAlerts(updated);
    localStorage.setItem("weather_alerts", JSON.stringify(updated));

    setTitle("");
    setMessage("");

    alert(`${type} Published Successfully!`);
  }

  function deleteInformation(id) {
    const updated = alerts.filter(item => item.id !== id);
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
        <p className="eyebrow">ADMIN CONTROL CENTER</p>
        <h1>Weather Management</h1>
        <p className="muted">
          Manage alerts, tips, announcements and seasonal updates.
        </p>

        <div className="stats-grid admin-stats">
          <div className="stat-card">
            <ShieldAlert />
            <p>Weather Alerts</p>
            <h3>{alerts.filter(a => a.type === "Weather Alert").length}</h3>
          </div>

          <div className="stat-card">
            <Sun />
            <p>Weather Tips</p>
            <h3>{alerts.filter(a => a.type === "Weather Tip").length}</h3>
          </div>

          <div className="stat-card">
            <Users />
            <p>Announcements</p>
            <h3>{alerts.filter(a => a.type === "Announcement").length}</h3>
          </div>

          <div className="stat-card">
            <CloudSun />
            <p>Season Updates</p>
            <h3>{alerts.filter(a => a.type === "Season Update").length}</h3>
          </div>
        </div>

        <section className="content-grid admin-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">CREATE CONTENT</p>
                <h2>Add New Information</h2>
              </div>
              <Plus size={25} />
            </div>

            <form className="admin-form" onSubmit={addInformation}>
              <label>Information Category</label>

              <select value={type} onChange={e => setType(e.target.value)}>
                <option>Weather Alert</option>
                <option>Weather Tip</option>
                <option>Announcement</option>
                <option>Season Update</option>
              </select>

              {type === "Season Update" && (
                <>
                  <label>Select Season</label>
                  <select
                    value={season}
                    onChange={e => setSeason(e.target.value)}
                  >
                    <option>Summer</option>
                    <option>Winter</option>
                    <option>Monsoon</option>
                    <option>Spring</option>
                    <option>Autumn</option>
                    <option>All Seasons</option>
                  </select>
                </>
              )}

              <label>Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter title"
                required
              />

              <label>Description</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Enter information..."
                rows="4"
                required
              />

              <button className="primary-btn" type="submit">
                <Plus size={18} /> Publish Information
              </button>
            </form>
          </div>

          <div className="panel">
            <p className="eyebrow">CONTENT MANAGEMENT</p>
            <h2>Published Information</h2>

            {alerts.length === 0 && (
              <p className="muted">No information published yet.</p>
            )}

            {alerts.map(item => (
              <div className="admin-alert" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.type}</p>
                  {item.type === "Season Update" && (
                    <p>Season: {item.season}</p>
                  )}
                  <p>{item.message}</p>
                  <small>{item.date}</small>
                </div>

                <button
                  className="delete-btn"
                  onClick={() => deleteInformation(item.id)}
                >
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
