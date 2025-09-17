"use client";
import React, { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const LogoutPage = () => {
    const router = useRouter();

    useEffect(() => {
        const logout = async () => {
            try {
                await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/logout`,
                    { withCredentials: true }
                );
                localStorage.clear();
                router.push("/login");
            } catch (error) {
                console.error("Logout failed:", error);
            }
        };

        logout();
    }, [router]);

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 border-4 border-t-black border-gray-200 rounded-full animate-spin"></div>
                <h1 className="text-xl font-semibold text-black">Logging out...</h1>
            </div>
        </div>
    );
};

export default LogoutPage;
