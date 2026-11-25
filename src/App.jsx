import {
  Bell,
  CloudSun,
  LayoutDashboard,
  LogOut,
  Users,
  Wind,
  Heart,
  Sun
} from "lucide-react";
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useOutletContext
} from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import UserDashboard from "./pages/UserDashboard";

function DashboardLayout({ account }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = account.role === "admin";
  const basePath = isAdmin ? "/admin" : "/user";
  const navigation = isAdmin
    ? [
        { label: "Overview", icon: LayoutDashboard, anchor: "" },
        { label: "User management", icon: Users, anchor: "#users" },
        { label: "Weather alerts", icon: Bell, anchor: "#alerts" },
        { label: "Announcements", icon: Wind, anchor: "#announcements" }
      ]
    : [
        { label: "Overview", icon: LayoutDashboard, anchor: "" },
        { label: "Forecast", icon: Sun, anchor: "#forecast" },
        { label: "Favorite cities", icon: Heart, anchor: "#favorites" },
        { label: "Weather alerts", icon: Bell, anchor: "#alerts" }
      ];

  function logout() {
    localStorage.removeItem("weather_logged_in");
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-layout">
      <aside className="app-sidebar">
        <Link className="app-logo" to={basePath}>
          <span className="app-logo-mark"><CloudSun size={24} /></span>
          <span>Weather<span>App</span></span>
        </Link>

        <div className="sidebar-caption">WORKSPACE</div>
        <nav className="sidebar-navigation" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon, anchor }) => {
            const href = `${basePath}${anchor}`;
            const active = anchor
              ? location.hash === anchor
              : location.pathname === basePath && !location.hash;

            return (
              <Link
                key={label}
                className={`sidebar-link${active ? " active" : ""}`}
                to={href}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-user">
          <div className="user-avatar">
            {(account.name || account.email || "W").charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-details">
            <strong>{account.name || "Weather user"}</strong>
            <span>{isAdmin ? "Administrator" : "Personal account"}</span>
          </div>
        </div>
        <button className="sidebar-logout" type="button" onClick={logout}>
          <LogOut size={17} /> Sign out
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="mobile-brand">
            <Link className="app-logo" to={basePath}>
              <span className="app-logo-mark"><CloudSun size={22} /></span>
              <span>Weather<span>App</span></span>
            </Link>
          </div>
          <div className="topbar-greeting">
            <span>{isAdmin ? "CONTROL CENTER" : "YOUR WEATHER, AT A GLANCE"}</span>
            <strong>
              {isAdmin ? "Weather operations" : `Hello, ${account.name || "there"}`}
            </strong>
          </div>
          <div className="topbar-date">
            <Sun size={17} />
            <span>{new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric"
            })}</span>
          </div>
        </header>
        <div className="dashboard-content">
          <Outlet context={{ account }} />
        </div>
      </main>
    </div>
  );
}

function ProtectedDashboard() {
  const account = JSON.parse(
    localStorage.getItem("weather_logged_in") || "null"
  );

  if (!account) return <Navigate to="/login" replace />;
  return (
    <DashboardLayout account={account}>
      <Outlet context={{ account }} />
    </DashboardLayout>
  );
}

function RequireRole({ role, children }) {
  const { account } = useOutletContext();
  if (account.role !== role) {
    return <Navigate to={account.role === "admin" ? "/admin" : "/user"} replace />;
  }
  return children;
}

function WeatherHome() {
  const { account } = useOutletContext();
  return account.role === "admin" ? <AdminDashboard /> : <UserDashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedDashboard />}>
        <Route
          path="/user"
          element={<RequireRole role="user"><UserDashboard /></RequireRole>}
        />
        <Route
          path="/admin"
          element={<RequireRole role="admin"><AdminDashboard /></RequireRole>}
        />
        <Route path="/weather" element={<WeatherHome />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
