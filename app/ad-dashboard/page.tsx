"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const AdDashboard = () => {
    const [adName, setAdName] = useState("Assistant Director");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isTakingAttendance, setIsTakingAttendance] = useState(false);
    const [isViewingRecords, setIsViewingRecords] = useState(false);
    const router = useRouter();

    // 🕒 Update current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // 🔒 Fetch Assistant Director info
    useEffect(() => {
        const fetchAD = async () => {
            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/me`,
                    { withCredentials: true }
                );
                if (res.data?.username) {
                    setAdName(res.data.username);
                }
            } catch (err) {
                console.error("❌ Failed to fetch AD info");
            }
        };

        fetchAD();
    }, []);

    // 🧠 Greeting logic
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 6) return "🌙 Good Night";
        if (hour < 12) return "🌞 Good Morning";
        if (hour < 18) return "🌤️ Good Afternoon";
        if (hour < 21) return "🌆 Good Evening";
        return "🌙 Good Night";
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 font-mono text-center space-y-6">
                {/* Logo */}
                <div className="flex justify-center mb-2">
                    <img
                        src="/logo.png"
                        alt="Sacred Heart Logo"
                        className="w-24 h-24 object-contain"
                    />
                </div>

                {/* Personalized Greeting */}
                <h2 className="text-2xl md:text-3xl font-bold text-black mb-1">
                    {getGreeting()},{adName} 🎉
                </h2>

                {/* Live Time */}
                <p className="text-sm text-black">
                    {currentTime.toLocaleString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    })}
                </p>

                {/* Action Buttons */}
                <div className="space-y-4 mt-4">
                    <button
                        onClick={() => {
                            setIsTakingAttendance(true);
                            router.push("/take-attendance");
                        }}
                        disabled={isTakingAttendance}
                        className={`w-full py-2 rounded-lg border bg-black border-black text-white font-semibold transition transform duration-200 ${isTakingAttendance
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-white hover:text-black hover:scale-105"
                            }`}
                    >
                        {isTakingAttendance ? (
                            <span className="flex justify-center items-center gap-2">
                                <span className="h-4 w-4 animate-spin border-2 border-black border-t-transparent rounded-full" />
                                Redirecting...
                            </span>
                        ) : (
                            "📋 Take Attendance"
                        )}
                    </button>

                    <button
                        onClick={() => {
                            setIsViewingRecords(true);
                            router.push("/attendance-records");
                        }}
                        disabled={isViewingRecords}
                        className={`w-full py-2 rounded-lg border bg-black border-black text-white font-semibold transition transform duration-200 ${isViewingRecords
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-white hover:text-black hover:scale-105"
                            }`}
                    >
                        {isViewingRecords ? (
                            <span className="flex justify-center items-center gap-2">
                                <span className="h-4 w-4 animate-spin border-2 border-black border-t-transparent rounded-full" />
                                Redirecting...
                            </span>
                        ) : (
                            "📑 Attendance Records"
                        )}
                    </button>
                </div>


                {/* Logout Button */}
                <button
                    onClick={() => router.push("/logout")}
                    className="mt-4 px-5 py-2 rounded-full font-semibold border-2 shadow transition-transform duration-200 transform
    bg-white  border-black hover:bg-white hover:text-black hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
    dark:bg-black dark:text-white dark:border-white dark:hover:scale-105"
                >
                    Logout
                </button>

            </div>
        </div>
    );
};

export default AdDashboard;
