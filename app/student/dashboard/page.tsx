"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Logout from "../../components/Logout";

const StudentDashboard = () => {
    const [studentName, setStudentName] = useState("Student");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loadingCircle, setLoadingCircle] = useState(true);
    const hasMounted = useRef(false);
    const router = useRouter();

    // ✅ Check authentication
    useEffect(() => {
        if (hasMounted.current) return;
        hasMounted.current = true;

        (async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/authenticate`,
                    { withCredentials: true }
                );

                const role = response.data.role;
                if (role === "ad") router.push("/ad-dashboard");
                if (role === "director") router.push("/attendance-records");

                if (response.data.isLoggedIn) {
                    const res = await axios.get(
                        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/me`,
                        { withCredentials: true }
                    );
                    // console.log(response);
                    if (res.data?.name) {
                        setStudentName(res.data.name);
                    }
                    setLoadingCircle(false);
                } else {
                    router.push("/login");
                }
            } catch (error) {
                console.log("❌ Auth check failed:", error);
                // router.push("/login");
            }
        })();
    }, []);

    // 🕒 Update live clock
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // 🎉 Greeting logic
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 6) return "Good Night";
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        if (hour < 21) return "Good Evening";
        return "Good Night";
    };

    return (
        <>
            {loadingCircle ? (
                <div className="h-screen w-screen flex items-center justify-center">
                    <div className="flex gap-2">
                        <div className="h-7 w-7 border-4 border-t-green-500 border-b-white rounded-full animate-spin"></div>
                        <h1 className="text-2xl">Loading...</h1>
                    </div>
                </div>
            ) : (
                <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 font-mono text-center space-y-6">
                        {/* Logo */}
                        <div className="flex justify-center mb-2">
                            <img
                                src="/logo.png"
                                alt="Sacred Heart Logo"
                                className="w-24 h-24 object-contain"
                            />
                        </div>

                        {/* Greeting */}
                        <h2 className="text-lg sm:text-2xl font-bold text-black">
                            {getGreeting()}, {studentName}
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
                                onClick={() => router.push("/student/attendance")}
                                className="w-full py-2 rounded-lg bg-black text-white font-semibold transition hover:bg-white hover:text-black hover:scale-105 border border-black transform duration-200"
                            >
                                📋 My Attendance
                            </button>

                            {/* <button
                                onClick={() => router.push("/student/internal-marks")}
                                className="w-full py-2 rounded-lg bg-black text-white font-semibold transition hover:bg-white hover:text-black hover:scale-105 border border-black transform duration-200"
                            >
                                📝 Internal Marks
                            </button> */}
                            <button
                                onClick={() => router.push("/student/leave")}
                                className="w-full py-2 rounded-lg bg-black text-white font-semibold transition hover:bg-white hover:text-black hover:scale-105 border border-black transform duration-200"
                            >
                                📅 Leave Request
                            </button>


                            <button
                                onClick={() => router.push("/student/profile")}
                                className="w-full py-2 rounded-lg bg-black text-white font-semibold transition hover:bg-white hover:text-black hover:scale-105 border border-black transform duration-200"
                            >
                                👤 My Profile
                            </button>
                        </div>

                        {/* Logout */}
                        <Logout />
                    </div>
                </div>
            )}
        </>
    );
};

export default StudentDashboard;
