import React from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Email:", email);
    console.log("Password:", password);

    const userData = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch("http://localhost:3002/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      localStorage.setItem("token", data.token);

      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");

      console.log("Response:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="login-bg d-flex justify-content-center align-items-center vh-100">
      <div className="card login-card p-4 shadow">
        <h3 className="text-center login-title mb-4">Welcome Back </h3>
        {error && <p className="text-danger text-center">{error}</p>}
        <div className="mb-3">
          <label className="login-label">Email</label>
          <input
            type="email"
            className="form-control login-input"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="login-label">Password</label>
          <input
            type="password"
            className="form-control login-input"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn w-100 login-button mt-3" onClick={handleSubmit}>
          Login
        </button>

        <p className="text-center login-text mt-3">
          New here?{" "}
          <Link to="/Signup" className="login-link">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
