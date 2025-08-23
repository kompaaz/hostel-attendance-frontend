"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const StudentAttendance = () => {
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState<any>(null);
    const [attendance, setAttendance] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                // ✅ Check authentication
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/authenticate`,
                    { withCredentials: true }
                );



                if (!response.data.isLoggedIn || response.data.role !== "student") {
                    return router.push("/login");
                }

                // ✅ Fetch student
                const resdata = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/me`,
                    { withCredentials: true }
                );


                // ✅ Fetch attendance
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/students/getAttendanceByStudent`,
                    { withCredentials: true }
                );

                console.log(res.data)

                setStudent(resdata.data);
                setAttendance(res.data.attendance || []);
                setLoading(false);
            } catch (err) {
                console.log("❌ Failed to load attendance", err);
                router.push("/student/dashboard");
            }
        })();
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <div className="flex gap-2 items-center">
                    <div className="h-7 w-7 border-4 border-t-green-500 border-b-transparent rounded-full animate-spin"></div>
                    <h1 className="text-2xl font-semibold text-black">Loading...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 font-mono text-center space-y-6">
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-1 font-mono">
                    📊 Attendance Record
                </h2>
                <p className="text-sm text-black text-center mb-6">
                    {student?.name} ({student?.dNo})
                </p>

                {/* Attendance Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50 text-black">
                            <tr>
                                <th className="px-4 py-2 border-b">Date</th>
                                <th className="px-4 py-2 border-b">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.length > 0 ? (
                                attendance.map((record: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border-b text-gray-900">
                                            {new Date(record.date).toLocaleDateString()}
                                        </td>
                                        <td
                                            className={`px-4 py-2 border-b font-semibold ${record.status === "present"
                                                ? "text-green-600"
                                                : "text-red-600"
                                                }`}
                                        >
                                            {record.status === "present" ? "✅ Present" : "❌ Absent"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="text-center text-gray-500 py-4 font-medium"
                                    >
                                        No attendance records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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

export default StudentAttendance;
