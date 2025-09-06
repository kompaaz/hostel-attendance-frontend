"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loading from "@/app/components/Loading";

const StudentProfile = () => {
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/authenticate`,
                    { withCredentials: true }
                );

                if (!response.data.isLoggedIn || response.data.role !== "student") {
                    return router.push("/login");
                }

                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/me`,
                    { withCredentials: true }
                );

                setStudent(res.data);
                setLoading(false);
            } catch (err) {
                console.log("❌ Failed to load profile", err);
                router.push("/login");
            }
        })();
    }, []);

    if (loading) {
        return (
            <Loading />
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 font-mono text-center space-y-6">
                {/* Logo */}
                <div className="flex justify-center mb-2">
                    <img
                        src="/logo.png"
                        alt="Sacred Heart Logo"
                        className="w-20 h-20 object-contain"
                    />
                </div>
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-1 font-mono">
                    Sacred Heart Hostel
                </h2>
                <p className="text-sm text-black text-center mb-6">
                    St. Joseph's College, Trichy
                </p>
                {/* Profile Photo */}
                {/* <div className="flex justify-center">
                    <img
                        src={student?.photoUrl || "/default-avatar.png"}
                        alt="Profile"
                        className="w-28 h-28 rounded-full border-4 border-gray-300 object-cover shadow-md"
                    />
                </div> */}

                {/* Name */}
                <h2 className="text-2xl font-bold text-gray-900">{student?.username}</h2>
                <p className="text-sm text-gray-700 font-medium">🎓 Student Profile</p>

                {/* Info Section */}
                <div className="space-y-3 text-left bg-gray-50 rounded-xl p-5 shadow-inner border border-gray-200">
                    <p className="text-gray-900">
                        <span className="font-semibold text-black">Name:</span>{" "}
                        {student?.name}
                    </p>
                    <p className="text-gray-900">
                        <span className="font-semibold text-black">Roll No:</span>{" "}
                        {student?.dNo}
                    </p>
                    <p className="text-gray-900">
                        <span className="font-semibold text-black">Account No:</span>{" "}
                        {student?.accNo || "N/A"}
                    </p>
                    <p className="text-gray-900">
                        <span className="font-semibold text-black">Room No:</span>{" "}
                        {student?.roomNo || "N/A"}
                    </p>
                    <p className="text-gray-900">
                        <span className="font-semibold text-black">Mobile:</span>{" "}
                        {student?.studentNo || "N/A"}
                    </p>
                    <p className="text-gray-900">
                        <span className="font-semibold text-black">Parent No:</span>{" "}
                        {student?.parentNo || "N/A"}
                    </p>
                </div>

                {/* Back Button */}
                <button
                    onClick={() => router.push("/student/dashboard")}
                    className="w-full py-2 rounded-lg bg-black text-white font-semibold transition hover:bg-gray-900 hover:scale-105 transform duration-200"
                >
                    ⬅ Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default StudentProfile;
