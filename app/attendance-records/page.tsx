"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

type RecordEntry = {
  _id: string;
  name: string;
  roomNo: string;
  accountNumber: string;
  status: string;
};

type RawAttendance = {
  _id: string;
  ad: { _id: string; username: string };
  date: string;
  type?: string; // Optional type field
  records: RecordEntry[];
};

const Page = () => {
  const [attendanceGroups, setAttendanceGroups] = useState<RawAttendance[]>([]);

  const getAttendanceData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/attendance/get-attendance-records`,
        { withCredentials: true }
      );

      setAttendanceGroups(response.data["attendance-records"]);
    } catch (error) {
      // console.error("Failed fetching attendance for displaying:", error);
    }
  };
  useEffect(() => {
    getAttendanceData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 md:px-6 py-8 font-sans">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 mb-8">
          <img
            src="/logo.png"
            alt="Sacred Heart Hostel Logo"
            className="w-24 h-24 sm:w-16 sm:h-16 object-contain"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 font-mono">
              Sacred Heart Hostel
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              E-Attendance Records
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:gap-8">
          {attendanceGroups.map((group) => (
            <div
              key={group._id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 transition hover:shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-5 gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    Assistant Director ID:{" "}
                    <span className="text-blue-600 break-all">
                      {group.ad.username}
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    📅 {new Date(group.date).toLocaleString()} | Type:{" "}
                    <span className="font-medium text-gray-700">
                      {group.type ?? "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
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
                        className={`transition ${
                          record.status.toLowerCase() === "present"
                            ? "bg-green-50 hover:bg-green-100"
                            : "bg-red-50 hover:bg-red-100"
                        }`}
                      >
                        <td className="px-2 sm:px-4 py-2">{index + 1}</td>
                        <td className="px-2 sm:px-4 py-2 font-medium">
                          {record.name}
                        </td>
                        <td className="px-2 sm:px-4 py-2">{record.roomNo}</td>
                        <td className="px-2 sm:px-4 py-2">
                          {record.accountNumber}
                        </td>
                        <td className="px-2 sm:px-4 py-2">
                          <span
                            className={`px-2 py-1 sm:px-3 rounded-full text-[10px] sm:text-xs font-semibold ${
                              record.status.toLowerCase() === "present"
                                ? "bg-green-200 text-green-800"
                                : "bg-red-200 text-red-800"
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
            </div>
          ))}
        </div>
      </div>
      <Link
        href="/logout"
        className="mt-8 inline-block text-blue-600 hover:underline"
      >
        <button>Logout</button>
      </Link>
    </main>
  );
};

export default Page;
