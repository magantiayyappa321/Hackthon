
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    const saved = JSON.parse(
      localStorage.getItem(`weather_${role}`) || "null"
    );

    if (!saved || saved.email !== email || saved.password !== password) {
      alert("Invalid email or password. Please signup first.");
      return;
    }

    localStorage.setItem("weather_logged_in", JSON.stringify(saved));
    navigate(role === "admin" ? "/admin" : "/user");
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleLogin}>
        <h2>Welcome Back</h2>
        <p>Login to SkySense Weather</p>

        <label>Login As</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <label>Email</label>
        <input type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email" required />

        <label>Password</label>
        <input type="password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password" required />

        <button type="submit">Login</button>
        <p>New here? <Link to="/signup">Create Account</Link></p>
      </form>
    </div>
  );
}
