"use client";
import React, { useEffect, useState } from "react";
import "../styles/attendance.css";

const groupedUsers = {
  "101": [
    { name: "Alice", accNo: "A001", dNo: "12" },
    { name: "Bob", accNo: "B002", dNo: "14" },
  ],
  "102": [
    { name: "Charlie", accNo: "C003", dNo: "16" },
    { name: "David", accNo: "D004", dNo: "18" },
  ],
};

const page = () => {
  const [statusMap, setStatusMap] = useState<any>({});
  const [datetime, setDatetime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setDatetime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = (accNo: string, status: string) => {
    setStatusMap((prev: any) => ({ ...prev, [accNo]: status }));
  };

  const getSummary = () => {
    const values = Object.values(statusMap);
    const present = values.filter((v) => v === "present").length;
    const absent = values.filter((v) => v === "absent").length;
    return { present, absent };
  };

  const handleSave = () => {
    const formattedRecords: any = [];
    Object.entries(groupedUsers).forEach(([room, students]) => {
      students.forEach((student) => {
        formattedRecords.push({
          accountNumber: student.accNo,
          name: student.name,
          status: statusMap[student.accNo] || "absent",
        });
      });
    });
    console.log("Sending data:", formattedRecords);
    // Simulate fetch or integrate API
  };

  const { present, absent } = getSummary();
  return (
    <>
      <header>
        <div className="header-left">
          <img src="/logo.png" alt="Logo" />
          <h1 className="text-3xl font-bold">E-Attendance</h1>
        </div>
        <div id="datetime">
          {new Date(datetime).toLocaleString("en-GB", {
            weekday: "short", // Mon
            day: "2-digit", // 28
            month: "short", // Jul
            year: "numeric", // 2025
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true, // am/pm format
          })}
        </div>
      </header>

      <div id="attendance-container">
        {Object.entries(groupedUsers).map(([room, students]) => (
          <div className="room-card" key={room}>
            <div className="room-title">Room {room}</div>
            <div className="student-list">
              {students.map((student) => (
                <div
                  className="student-card"
                  key={student.accNo}
                  data-name={student.name}
                  data-acc={student.accNo}
                >
                  <div className="student-name">
                    {student.name} ({student.dNo})
                  </div>
                  <div className="status-buttons">
                    <button
                      className={`status-btn present ${
                        statusMap[student.accNo] === "present" ? "active" : ""
                      }`}
                      onClick={() =>
                        handleStatusChange(student.accNo, "present")
                      }
                    >
                      P
                    </button>
                    <button
                      className={`status-btn absent ${
                        statusMap[student.accNo] === "absent" ? "active" : ""
                      }`}
                      onClick={() =>
                        handleStatusChange(student.accNo, "absent")
                      }
                    >
                      A
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button id="saveBtn" onClick={handleSave}>
        ✅ Save Attendance
      </button>
      <div id="summary">
        Total Present: {present} | Total Absent: {absent}
      </div>
    </>
  );
};

export default page;
