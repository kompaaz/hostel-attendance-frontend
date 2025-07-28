"use client"; // Only if using Next.js App Router

import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // For Next.js
// import { useRouter } from 'expo-router'; // For Expo Router (uncomment if using Expo)

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        await axios.get("https://sh-backend.devnoel.org/api/auth/logout", {
        // await axios.get("http://localhost:5000/api/auth/logout", {
          // await axios.get(`${process.env.BASE_URL}/api/auth/logout`, {
          withCredentials: true, // Send cookies/session if needed
        });

        // Optionally clear any localStorage or tokens
        localStorage.clear();

        // Redirect to login
        router.push("/login");
      } catch (error) {
        console.error("Logout failed:", error);
        router.push("/login"); // Still redirect to login even if API call fails
      }
    };

    logout();
  }, [router]);

  return <p>Logging you out...</p>;
}
