"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const Logout = () => {
  const router = useRouter();

  const logout = async () => {
    try {
      const reponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/logout`,
        {
          withCredentials: true,
          headers: {
            "Cache-Control": "no-store",
            Pragma: "no-cache",
            Expires: "0",
          }, // Send cookies/session if needed
        }
      );
      // Optionally clear any localStorage or tokens
      console.log(reponse.data);

      alert(reponse.data.message);
      localStorage.clear();
      // Redirect to login
      // router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/login"); // Still redirect to login even if API call fails
    }
  };

  return (
    <>
      <button
        onClick={logout}
        className="mt-4 px-5 py-2 rounded-full font-semibold border-2  shadow transition-transform duration-200 transform
    bg-white  hover:border-black hover:bg-white hover:text-black hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
    dark:bg-black dark:text-white dark:border-white dark:hover:scale-105"
      >
        Logout
      </button>
    </>
  );
};

export default Logout;
