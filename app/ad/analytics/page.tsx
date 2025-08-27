"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface RecordEntry {
    _id: string;
    name: string;
    roomNo: string;
    accountNumber: string;
    status: string;
}

interface RawAttendance {
    _id: string;
    ad: { _id: string; username: string };
    date: string;
    type?: string;
    records: RecordEntry[];
}

interface StudentAbsence {
    _id: string;
    name: string;
    roomNo: string;
    accountNumber: string;
    absentCount: number;
    records: { date: string; status: string }[];
}

interface Option {
    label: string;
    value: string;
}

const AnalyticsPage = () => {
    const [attendanceGroups, setAttendanceGroups] = useState<RawAttendance[]>([]);
    const [absenceReport, setAbsenceReport] = useState<StudentAbsence[]>([]);
    const [weekOptions, setWeekOptions] = useState<Option[]>([]);
    const [monthOptions, setMonthOptions] = useState<Option[]>([]);

    const [reportType, setReportType] = useState<"weekly" | "monthly">("weekly");
    const [selectedWeek, setSelectedWeek] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    // Generate week options (last 12 weeks)
    const generateWeekOptions = (): Option[] => {
        const options: Option[] = [];
        const today = new Date();
        for (let i = 0; i < 12; i++) {
            const end = new Date(today);
            end.setDate(end.getDate() - end.getDay() - i * 7);
            const start = new Date(end);
            start.setDate(start.getDate() - 6);
            options.push({
                label: `${start.toLocaleDateString("en-GB")} - ${end.toLocaleDateString("en-GB")}`,
                value: `${start.toISOString().split("T")[0]}_${end.toISOString().split("T")[0]}`,
            });
        }
        return options;
    };

    // Generate month options (last 12 months)
    const generateMonthOptions = (): Option[] => {
        const options: Option[] = [];
        const today = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            options.push({
                label: date.toLocaleString("en-GB", { month: "long", year: "numeric" }),
                value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
            });
        }
        return options;
    };

    // Fetch attendance records from backend with date range
    const fetchAttendance = async (from: string, to: string) => {
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/attendance/get-attendance-records`,
            {
                params: { from, to },
                withCredentials: true, // ✅ ensures cookie is sent
            }
        );
        return res.data["attendance-records"];
    };


    const getAttendanceData = async () => {
        try {
            setLoading(true);

            let startDate: Date, endDate: Date;

            if (reportType === "weekly" && selectedWeek) {
                const [start, end] = selectedWeek.split("_");
                startDate = new Date(start);
                endDate = new Date(end);
                endDate.setHours(23, 59, 59, 999);
            } else if (reportType === "monthly" && selectedMonth) {
                const [year, month] = selectedMonth.split("-");
                startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
                endDate = new Date(parseInt(year), parseInt(month), 0);
                endDate.setHours(23, 59, 59, 999);
            } else {
                setLoading(false);
                return;
            }

            const data = await fetchAttendance(startDate.toISOString(), endDate.toISOString());
            setAttendanceGroups(data);

            // Generate absence report
            const absenceMap = new Map<string, StudentAbsence>();

            data.forEach((record: RawAttendance) => {
                const recordDate = new Date(record.date).toISOString().split("T")[0];
                record.records.forEach((student: RecordEntry) => {
                    const key = student.accountNumber;

                    if (!absenceMap.has(key)) {
                        absenceMap.set(key, {
                            _id: student._id,
                            name: student.name,
                            roomNo: student.roomNo,
                            accountNumber: student.accountNumber,
                            absentCount: 0,
                            records: [],
                        });
                    }

                    const studentRecord = absenceMap.get(key)!;
                    studentRecord.records.push({
                        date: recordDate,
                        status: student.status,
                    });

                    if (student.status.toLowerCase() === "absent") {
                        studentRecord.absentCount += 1;
                    }
                });
            });

            const report = Array.from(absenceMap.values())
                .filter((student) => student.absentCount > 0)
                .sort((a, b) => b.absentCount - a.absentCount);

            setAbsenceReport(report);
        } catch (error) {
            console.error("Error fetching attendance data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initialize options and set defaults
    useEffect(() => {
        const weeks = generateWeekOptions();
        const months = generateMonthOptions();

        setWeekOptions(weeks);
        setMonthOptions(months);

        if (!selectedWeek && weeks.length > 0) setSelectedWeek(weeks[0].value);
        if (!selectedMonth && months.length > 0) setSelectedMonth(months[0].value);
    }, []);

    // Fetch data whenever filters change
    useEffect(() => {
        if ((reportType === "weekly" && selectedWeek) || (reportType === "monthly" && selectedMonth)) {
            getAttendanceData();
        }
    }, [reportType, selectedWeek, selectedMonth]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex gap-2 items-center">
                    <div className="h-7 w-7 border-4 border-t-green-500 border-gray-200 rounded-full animate-spin"></div>
                    <h1 className="text-lg font-semibold text-gray-700">Loading attendance data...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-800 p-6">
            {/* Header */}
            <header className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="h-10" />
                    <h1 className="text-2xl font-bold">E-Attendance Analytics</h1>
                </div>
                <button
                    onClick={() => router.push("/ad/dashboard")}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white shadow hover:shadow-md transition"
                >
                    🔙 Back to Dashboard
                </button>
            </header>


            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as "weekly" | "monthly")}
                    className="border border-gray-300 px-3 py-2 rounded-lg shadow-sm bg-white w-full sm:w-auto"
                >
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                </select>

                {reportType === "weekly" && (
                    <select
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded-lg shadow-sm bg-white w-full sm:w-auto"
                    >
                        {weekOptions.map((week) => (
                            <option key={week.value} value={week.value}>
                                {week.label}
                            </option>
                        ))}
                    </select>
                )}

                {reportType === "monthly" && (
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border border-gray-300 px-3 py-2 rounded-lg shadow-sm bg-white w-full sm:w-auto"
                    >
                        {monthOptions.map((month) => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>
                )}
            </div>


            {/* Report */}
            <h2 className="text-lg font-semibold mb-4">
                Absence Report ({reportType === "weekly" ? selectedWeek : selectedMonth})
            </h2>

            {absenceReport.length === 0 ? (
                <p className="text-gray-500">No absences found for this period ✅</p>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow">
                    <table className="w-full border border-gray-200 bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border border-gray-200 px-3 py-2 text-left">Name</th>
                                <th className="border border-gray-200 px-3 py-2 text-left">Room No</th>
                                <th className="border border-gray-200 px-3 py-2 text-left">Account No</th>
                                <th className="border border-gray-200 px-3 py-2 text-left">Total Absences</th>
                            </tr>
                        </thead>
                        <tbody>
                            {absenceReport.map((student, i) => (
                                <tr key={student._id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="border border-gray-200 px-3 py-2">{student.name}</td>
                                    <td className="border border-gray-200 px-3 py-2">{student.roomNo}</td>
                                    <td className="border border-gray-200 px-3 py-2">{student.accountNumber}</td>
                                    <td className="border border-gray-200 px-3 py-2 font-bold text-red-600">
                                        {student.absentCount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
