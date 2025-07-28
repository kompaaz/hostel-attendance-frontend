"use client";
import React, { useState } from "react";
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
        "http://localhost:5000/api/auth/login",
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      router.push("/take-attendance");
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data?.message || "❌ Invalid credentials");
      } else {
        setError(
          "🚨 Cannot connect to server. Check if API is running and CORS is allowed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/logo.png" // Replace with your logo path
            alt="Sacred Heart Logo"
            className="w-16 h-16 object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-1 font-mono">
          Sacred Heart Hostel
        </h2>
        <p className="text-sm text-black text-center mb-6">
          E - Attendance Login
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 font-mono">
          <div>
            <label htmlFor="username" className="text-sm font-medium text-black mb-1 block">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-black"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-black mb-1 block">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10 transition text-black"
              />
              <div
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-2.5 right-3 text-black cursor-pointer"
              >
                {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
              </div>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg bg-black text-white font-semibold transition hover:bg-gray-900 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
