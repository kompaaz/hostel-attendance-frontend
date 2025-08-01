"use client";
import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        const reponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/logout`,
          {
            withCredentials: true, // Send cookies/session if needed
          }
        );

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

  return (
    <div>
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="flex gap-2">
          <div className="flex gap-3">
            <div className="h-7 w-7 border-4 border-t-green-500 border-b-white rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl">Logging you out...</h1>
        </div>
      </div>
    </div>
  );
}
