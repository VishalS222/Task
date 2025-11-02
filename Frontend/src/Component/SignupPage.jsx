import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import "./Signup.css";
import API_URL from "../API";
function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    console.log(name, email, password);
    try {
       const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setSuccess("Account Created Successfully ✅");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError("Server not responding. Try again later.");
    }
  };

  return (
    <div className="signup-bg d-flex justify-content-center align-items-center vh-100">
      <div className="card signup-card p-4 shadow">
        <h3 className="text-center signup-title mb-3">Create Account </h3>

        {error && <p className="text-danger text-center mb-2">{error}</p>}

        {success && <p className="text-success text-center mb-2">{success}</p>}

        <div className="mb-3">
          <label className="signup-label">Full Name</label>
          <input
            type="text"
            value={name}
            className="form-control signup-input"
            placeholder="Enter your full name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="signup-label">Email</label>
          <input
            type="email"
            value={email}
            className="form-control signup-input"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="signup-label">Password</label>
          <input
            type="password"
            className="form-control signup-input"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn w-100 signup-button mt-2" onClick={handleSignup}>
          Register
        </button>

        <p className="text-center signup-text mt-3">
          Already have an account?{" "}
          <Link to="/" className="signup-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
