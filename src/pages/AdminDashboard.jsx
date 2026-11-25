import { useState } from "react";
import {
  Bell,
  CloudSun,
  Megaphone,
  Plus,
  ShieldAlert,
  Sun,
  Trash2,
  Users
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { getRegisteredAccounts, removeAccount } from "../utils/accounts";

function readAlerts() {
  return JSON.parse(localStorage.getItem("weather_alerts") || "[]");
}

export default function AdminDashboard() {
  const { account } = useOutletContext();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("Weather Alert");
  const [season, setSeason] = useState("All Seasons");
  const [alerts, setAlerts] = useState(readAlerts);
  const [accounts, setAccounts] = useState(getRegisteredAccounts);
  const users = accounts.filter((saved) => saved.role === "user");
  const announcements = alerts.filter((item) => item.type === "Announcement");

  function addInformation(event) {
    event.preventDefault();
    const newItem = {
      id: Date.now(),
      title,
      message,
      type,
      season: type === "Season Update" ? season : undefined,
      date: new Date().toLocaleDateString()
    };
    const updated = [...alerts, newItem];
    setAlerts(updated);
    localStorage.setItem("weather_alerts", JSON.stringify(updated));
    setTitle("");
    setMessage("");
  }

  function deleteInformation(id) {
    const updated = alerts.filter((item) => item.id !== id);
    setAlerts(updated);
    localStorage.setItem("weather_alerts", JSON.stringify(updated));
  }

  function deleteUser(user) {
    if (user.email === account.email && user.role === account.role) return;
    if (!window.confirm(`Remove ${user.name || user.email} from registered users?`)) {
      return;
    }
    removeAccount(user);
    setAccounts(getRegisteredAccounts());
  }

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Weather operations</h1>
          <p className="subheading">Manage your community, weather alerts and helpful updates.</p>
        </div>
        <div className="admin-welcome"><CloudSun size={19} /> Signed in as {account.name || "Administrator"}</div>
      </section>

      <section className="admin-stats-grid" aria-label="Dashboard statistics">
        <article className="admin-stat-card">
          <span className="stat-icon cyan"><Users size={20} /></span>
          <p>Registered users</p><strong>{users.length}</strong>
          <small>Personal weather accounts</small>
        </article>
        <article className="admin-stat-card">
          <span className="stat-icon blue"><ShieldAlert size={20} /></span>
          <p>Weather alerts</p><strong>{alerts.filter((item) => item.type === "Weather Alert").length}</strong>
          <small>Published to the dashboard</small>
        </article>
        <article className="admin-stat-card">
          <span className="stat-icon amber"><Megaphone size={20} /></span>
          <p>Announcements</p><strong>{announcements.length}</strong>
          <small>Updates for your community</small>
        </article>
        <article className="admin-stat-card">
          <span className="stat-icon violet"><Sun size={20} /></span>
          <p>Published updates</p><strong>{alerts.length}</strong>
          <small>Alerts, tips and seasonal notes</small>
        </article>
      </section>

      <section className="admin-content-grid">
        <section className="panel-card admin-compose">
          <div className="section-heading">
            <div><p className="eyebrow">PUBLISH AN UPDATE</p><h2>Create weather information</h2></div>
            <Plus className="heading-icon" size={23} />
          </div>
          <form className="admin-form" onSubmit={addInformation}>
            <label htmlFor="information-type">Information type</label>
            <select id="information-type" value={type} onChange={(event) => setType(event.target.value)}>
              <option>Weather Alert</option>
              <option>Weather Tip</option>
              <option>Announcement</option>
              <option>Season Update</option>
            </select>

            {type === "Season Update" && (
              <>
                <label htmlFor="information-season">Season</label>
                <select id="information-season" value={season} onChange={(event) => setSeason(event.target.value)}>
                  <option>All Seasons</option>
                  <option>Summer</option>
                  <option>Monsoon</option>
                  <option>Autumn</option>
                  <option>Winter</option>
                  <option>Spring</option>
                </select>
              </>
            )}

            <label htmlFor="information-title">Title</label>
            <input id="information-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Heavy rain expected this evening" required />
            <label htmlFor="information-message">Details</label>
            <textarea id="information-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Share useful details with your community..." rows="4" required />
            <button className="primary-button" type="submit"><Plus size={17} /> Publish update</button>
          </form>
        </section>

        <section className="panel-card" id="alerts">
          <div className="section-heading">
            <div><p className="eyebrow">CONTENT MANAGEMENT</p><h2>Weather alerts & updates</h2></div>
            <Bell className="heading-icon" size={22} />
          </div>
          {alerts.length === 0 ? (
            <p className="empty-copy">No published information yet. Create an update to share it with users.</p>
          ) : (
            <div className="admin-alert-list">
              {alerts.map((item) => (
                <article className="admin-alert-row" key={item.id}>
                  <span className="alert-mark"><ShieldAlert size={17} /></span>
                  <div className="admin-alert-copy">
                    <div className="alert-title-row"><strong>{item.title}</strong><span>{item.type}</span></div>
                    <p>{item.message}</p>
                    {item.season && <small>{item.season} · </small>}
                    <small>{item.date || "Published"}</small>
                  </div>
                  <button className="icon-action danger" type="button" onClick={() => deleteInformation(item.id)} aria-label={`Delete ${item.title}`}>
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <section className="admin-content-grid admin-lower-grid">
        <section className="panel-card user-management" id="users">
          <div className="section-heading">
            <div><p className="eyebrow">ACCOUNT DIRECTORY</p><h2>User management</h2></div>
            <Users className="heading-icon" size={22} />
          </div>
          <div className="user-table-wrap">
            <table className="user-table">
              <thead><tr><th>Account</th><th>Email</th><th>Role</th><th>Manage</th></tr></thead>
              <tbody>
                {accounts.map((saved) => {
                  const isSelf = saved.role === account.role && saved.email === account.email;
                  return (
                    <tr key={`${saved.role}-${saved.email}`}>
                      <td><strong>{saved.name || "Weather user"}</strong></td>
                      <td>{saved.email}</td>
                      <td><span className={`role-badge ${saved.role}`}>{saved.role}</span></td>
                      <td>
                        <button
                          className="icon-action danger"
                          type="button"
                          onClick={() => deleteUser(saved)}
                          disabled={isSelf}
                          aria-label={isSelf ? "You cannot remove your active account" : `Remove ${saved.name || saved.email}`}
                          title={isSelf ? "Your active account cannot be removed" : "Remove account"}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {accounts.length === 0 && <p className="empty-copy">No registered accounts found.</p>}
          </div>
        </section>

        <section className="panel-card" id="announcements">
          <div className="section-heading">
            <div><p className="eyebrow">COMMUNITY UPDATES</p><h2>Announcements</h2></div>
            <Megaphone className="heading-icon" size={22} />
          </div>
          {announcements.length === 0 ? (
            <p className="empty-copy">Announcements you publish will appear here and on user dashboards.</p>
          ) : (
            <div className="announcement-list">
              {announcements.map((item) => (
                <article className="announcement-item" key={item.id}>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <small>{item.date || "Published"}</small>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
