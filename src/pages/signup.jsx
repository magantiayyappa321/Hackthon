
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSignup(e) {
    e.preventDefault();

    const account = { name, email, password, role };
    localStorage.setItem(`weather_${role}`, JSON.stringify(account));

    alert("Signup Successful!");
    navigate("/login");
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSignup}>
        <h2>Create Account</h2>
        <p>Join SkySense Weather</p>

        <label>Account Type</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <label>Full Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name" required />

        <label>Email</label>
        <input type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email" required />

        <label>Password</label>
        <input type="password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create password" required />

        <button type="submit">Create Account</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
