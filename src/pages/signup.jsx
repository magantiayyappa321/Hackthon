
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveAccount } from "../utils/accounts";

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSignup(e) {
    e.preventDefault();

    const account = { name, email, password, role };
    saveAccount(account);

    alert("Signup Successful!");
    navigate("/login");
  }

  return (
    <div className="auth-page">
      <div className="auth-sky" aria-hidden="true">
        <span className="auth-sun" />
        <span className="auth-cloud auth-cloud-one" />
        <span className="auth-cloud auth-cloud-two" />
        <span className="auth-cloud auth-cloud-three" />
      </div>
      <form className="auth-card signup-card" onSubmit={handleSignup}>
        <div className="auth-brand"><span className="auth-brand-icon">☀</span> Weather App</div>
        <h1>Make weather personal</h1>
        <p className="auth-description">Create your account to save places and stay one step ahead.</p>

        <label htmlFor="signup-role">Account type</label>
        <select id="signup-role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <label htmlFor="signup-name">Full name</label>
        <input id="signup-name" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name" required />

        <label htmlFor="signup-email">Email</label>
        <input id="signup-email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email" required />

        <label htmlFor="signup-password">Password</label>
        <input id="signup-password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create password" required />

        <button type="submit">Create your account</button>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
