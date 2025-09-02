"use client";
import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loading from "../components/Loading";

const LoginPage = () => {
  const [checkingUserStatus, setcheckingUserStatus] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/authenticate`,
          { withCredentials: true }
        );
        const isLoggedIn = response.data.isLoggedIn;
        const userRole = response.data.role;

        if (!isLoggedIn) {
          return setcheckingUserStatus(false);
        }
        if (userRole === "director") {
          router.push("/director/dashboard");
        } else if (userRole === "student") {
          router.push("/student/dashboard");
        } else if (userRole === "ad") {
          router.push("/ad/dashboard");
        } else {
          setError("❌ Unknown role. Contact support.");
        }
      } catch (error) {
        // console.log("Error in isUserLoggedIn \n" + error);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/login`,
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      // console.log(response);
      const userRole = response.data?.user?.role;

      // Redirect based on role
      if (userRole === "director") {
        router.push("/director/dashboard");
      } else if (userRole === "student") {
        router.push("/student/dashboard");
      } else if (userRole === "ad") {
        router.push("/ad/dashboard");
      } else {
        setError("❌ Unknown role. Contact support.");
      }
      // router.push("/take-attendance");
    } catch (err: any) {
      // console.log(err.message);
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
    <>
      {checkingUserStatus ? (
        // <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        //     <div className="flex flex-col items-center gap-3">
        //         <div className="h-8 w-8 border-4 border-t-black border-gray-200 rounded-full animate-spin"></div>
        //         <h1 className="text-xl font-semibold text-black">Logging out...</h1>
        //     </div>
        // </div>
        <>
          <Loading />
        </>
      ) : (
        <div className="h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img
                src="/logo.png" // Replace with your logo path
                alt="Sacred Heart Logo"
                className="w-24 h-24 object-contain"
              />
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-1 font-mono">
              Sacred Heart Hostel
            </h2>
            <p className="text-sm text-black text-center mb-6">
              St. Joseph's College, Trichy
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 font-mono">
              <div>
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-black mb-1 block"
                >
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
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-black mb-1 block"
                >
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
                    {showPassword ? (
                      <FaEye size={18} />
                    ) : (
                      <FaEyeSlash size={18} />
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-lg bg-black text-white font-semibold transition hover:bg-gray-900 ${loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;
