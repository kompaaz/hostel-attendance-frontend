"use client";
import React, { useState } from "react";
import "../styles/login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
   const response = await axios.post(
  "http://localhost:5000/api/auth/login", // NOT https!
  {
    username,
    password,
  },
  {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true, // only if you use cookies/sessions
  }
);

    alert("✅ Login successful");
    console.log(response.data); // optional: see response
    router.push("/dashboard"); // or wherever you want to redirect
  } catch (err: any) {
    console.error("Login error:", err);

    if (err.response) {
      setError(err.response.data?.message || "❌ Invalid credentials");
    } else {
      setError("🚨 Cannot connect to server. Check if API is deployed and CORS is allowed.");
    }
  } finally {
    setLoading(false);
  }

  console.log("Login attempt:", { username, password });

};

  return (
    <div className="container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="text-3xl font-semibold mb-4">Login</h2>

        <label htmlFor="username" className="text-black">Username</label>
        <div className="px-2 border-2 rounded-xl mb-4">
          <input
            className="h-10 text-black outline-none w-full"
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>

        <label htmlFor="password" className="text-black">Password</label>
        <div className="px-2 flex items-center justify-between border-2 rounded-xl mb-4">
          <input
            className="h-10 text-black outline-none w-full"
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
          <div
            className="text-black ml-2 cursor-pointer"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
