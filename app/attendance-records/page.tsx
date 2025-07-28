"use client";
import React, { useEffect, useState } from "react";
import "../styles/attendance-record.css";
import axios from "axios";

type RecordEntry = {
  _id: string;
  name: string;
  accountNumber: string;
  status: string;
};

type RawAttendance = {
  _id: string;
  ad: { _id: string; username: string };
  date: string;
  records: RecordEntry[];
};

type AttendanceEntry = {
  adUsername: string;
  date: string;
  records: RecordEntry[];
};

const Page = () => {
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);

  const getAttendanceData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/display_attendance",
        { withCredentials: true }
      );

      const raw: { "attendance-records": RawAttendance[] } = response.data;

      const mapped: AttendanceEntry[] = raw["attendance-records"].map((ea) => ({
        adUsername: ea.ad.username,
        date: ea.date,
        records: ea.records,
      }));
      setAttendance(mapped);
    } catch (error) {
      console.error("Failed fetching attendance:", error);
    }
  };

  useEffect(() => {
    getAttendanceData();
  }, []);

  // Group by AD username
  const groupedByAD: Record<string, AttendanceEntry[]> = {};
  attendance.forEach((entry) => {
    if (!groupedByAD[entry.adUsername]) {
      groupedByAD[entry.adUsername] = [];
    }
    groupedByAD[entry.adUsername].push(entry);
  });

  return (
    <>
      <h1 className="pl-5 text-black text-3xl font-bold">
        📋 Attendance List (Grouped by AD)
      </h1>
      {Object.entries(groupedByAD).map(([adUsername, sessions]) => (
        <div className="ad-block m-10" key={adUsername}>
          <h2 className="text-xl pb-5 font-bold">
            🧑‍🏫 Assistant Director: {adUsername}
          </h2>
          {sessions.map((session, idx) => (
            <div key={idx}>
              <p className="text-black">
                <strong>Date:</strong>{" "}
                {new Date(session.date).toLocaleDateString("en-IN")}
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Account Number</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="text-black">
                  {session.records.map((rec) => (
                    <tr key={rec._id}>
                      <td>{rec.name}</td>
                      <td>{rec.accountNumber}</td>
                      <td>{rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default Page;
