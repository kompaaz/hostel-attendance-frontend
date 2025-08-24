"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
type RecordEntry = {
    _id: string;
    name: string;
    roomNo: string;
    accountNumber: string;
    status: string; // "present" | "absent" | "leave"
};

type RawAttendance = {
    _id: string;
    ad: { _id: string; username: string };
    date: string;
    type?: string;
    records: RecordEntry[];
};

const DirectorAttendancePage = () => {
    const [attendanceGroups, setAttendanceGroups] = useState<RawAttendance[]>([]);
    const [onlyCount, setOnlyCount] = useState<boolean>(false);
    const router = useRouter();
    const getAttendanceData = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/attendance/get-attendance-records`,
                { withCredentials: true }
            );
            setAttendanceGroups(response.data["attendance-records"] || []);
        } catch (error) {
            console.error("Failed fetching attendance:", error);
        }
    };

    useEffect(() => {
        getAttendanceData();
    }, []);

    const computeCounts = (records: RecordEntry[]) => {
        const present = records.filter(r => r.status.toLowerCase() === "present").length;
        const absent = records.filter(r => r.status.toLowerCase() === "absent").length;
        const leave = records.filter(r => r.status.toLowerCase() === "leave").length;
        return { present, absent, leave };
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 md:px-6 py-8 font-sans">
            <div className="flex flex-col items-center">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 mb-6">
                    <img src="/logo.png" alt="Logo" className="w-24 h-24 sm:w-16 sm:h-16 object-contain" />
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-mono">
                            Director Attendance Dashboard
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">View all attendance records</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push("/director/dashboard")}
                    className="mb-4 px-4 py-2 rounded-lg border font-mono border-black bg-white text-black font-semibold transition hover:scale-105"
                >
                    🔙 Back to Dashboard
                </button>

                {/* Only Count Option */}
                <div className="mb-4">
                    <label className="flex items-center gap-2 text-gray-700 font-medium">
                        <input
                            type="checkbox"
                            checked={onlyCount}
                            onChange={() => setOnlyCount(!onlyCount)}
                        />
                        Only Show Count
                    </label>
                </div>

                {/* Attendance Records */}
                <div className="w-[90vw] space-y-6">
                    {attendanceGroups.length === 0 ? (
                        <div className="text-center text-gray-500 mt-6">
                            No attendance records found.
                        </div>
                    ) : (
                        attendanceGroups.map(group => {
                            const { present, absent, leave } = computeCounts(group.records);

                            return (
                                <div key={group._id} className="bg-white rounded-2xl shadow-md border p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-5 gap-2">
                                        <div>
                                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                                                AD: <span className="text-blue-600">{group.ad.username}</span>
                                            </h2>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                                📅 {new Date(group.date).toLocaleString()} | Type:{" "}
                                                <span className="font-medium text-gray-700">{group.type ?? "N/A"}</span>
                                            </p>
                                        </div>
                                        <div className="text-sm sm:text-base font-semibold text-gray-800">
                                            Present: {present} | Absent: {absent} | Leave: {leave} | Total: {group.records.length}
                                        </div>
                                    </div>

                                    {/* Show table only if not "Only Count" */}
                                    {!onlyCount && group.records.length > 0 && (
                                        <div className="overflow-x-auto mt-3">
                                            <table className="min-w-full text-xs sm:text-sm divide-y divide-gray-200">
                                                <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider text-[10px] sm:text-xs">
                                                    <tr>
                                                        <th className="px-2 sm:px-4 py-2 text-left">#</th>
                                                        <th className="px-2 sm:px-4 py-2 text-left">Name</th>
                                                        <th className="px-2 sm:px-4 py-2 text-left">Room No</th>
                                                        <th className="px-2 sm:px-4 py-2 text-left">Acc No</th>
                                                        <th className="px-2 sm:px-4 py-2 text-left">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-gray-800">
                                                    {group.records.map((record, index) => (
                                                        <tr
                                                            key={record._id}
                                                            className={`transition ${record.status.toLowerCase() === "present"
                                                                ? "bg-green-50 hover:bg-green-100"
                                                                : record.status.toLowerCase() === "absent"
                                                                    ? "bg-red-50 hover:bg-red-100"
                                                                    : "bg-yellow-50 hover:bg-yellow-100"
                                                                }`}
                                                        >
                                                            <td className="px-2 sm:px-4 py-2">{index + 1}</td>
                                                            <td className="px-2 sm:px-4 py-2 font-medium">{record.name}</td>
                                                            <td className="px-2 sm:px-4 py-2">{record.roomNo}</td>
                                                            <td className="px-2 sm:px-4 py-2">{record.accountNumber}</td>
                                                            <td className="px-2 sm:px-4 py-2">
                                                                <span
                                                                    className={`px-2 py-1 sm:px-3 rounded-full text-[10px] sm:text-xs font-semibold ${record.status.toLowerCase() === "present"
                                                                        ? "bg-green-200 text-green-800"
                                                                        : record.status.toLowerCase() === "absent"
                                                                            ? "bg-red-200 text-red-800"
                                                                            : "bg-yellow-200 text-yellow-800"
                                                                        }`}
                                                                >
                                                                    {record.status.toUpperCase()}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default DirectorAttendancePage;
