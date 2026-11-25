
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRegisteredAccounts } from "../utils/accounts";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    const saved = getRegisteredAccounts().find(
      (account) =>
        account.role === role &&
        account.email === email &&
        account.password === password
    );

    if (!saved) {
      alert("Invalid email or password. Please signup first.");
      return;
    }

    localStorage.setItem("weather_logged_in", JSON.stringify(saved));
    navigate(role === "admin" ? "/admin" : "/user");
  }

  return (
    <div className="auth-page login-page">
      <div className="auth-sky" aria-hidden="true">
        <span className="auth-sun" />
        <span className="auth-cloud auth-cloud-one" />
        <span className="auth-cloud auth-cloud-two" />
        <span className="auth-cloud auth-cloud-three" />
      </div>
      <form className="auth-card" onSubmit={handleLogin}>
        <div className="auth-brand"><span className="auth-brand-icon">☀</span> Weather App</div>
        <h1>Welcome to your forecast</h1>
        <p className="auth-description">Sign in to see the weather that matters to you.</p>

        <label htmlFor="login-role">Login as</label>
        <select id="login-role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email" required />

        <label htmlFor="login-password">Password</label>
        <input id="login-password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password" required />

        <button type="submit">Sign in</button>
        <p className="auth-footer">New to Weather App? <Link to="/signup">Create an account</Link></p>
      </form>
    </div>
  );
}
