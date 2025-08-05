"use client";
import React, { useEffect, useState } from "react";
import "../styles/attendance.css";
import axios from "axios";
import { useRouter } from "next/navigation";

type Student = {
  _id: string;
  name: string;
  dNo: string;
  accNo: number;
  roomNo: string;
};

type StudentData = {
  [room: string]: Student[];
};

const Page = () => {
  const router = useRouter();
  const [statusMap, setStatusMap] = useState<Record<number, string>>({});
  const [datetime, setDatetime] = useState<Date | null>(null);
  const [studentData, setStudentData] = useState<StudentData>({});
  const [loadingCircle, setloadingCircle] = useState(true);

  const getStudentData = useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/authenticate`,
          { withCredentials: true }
        );
        // is user is not logged in we are redirecting to login
        const isLoggedIn = response.data.isLoggedIn;
        if (isLoggedIn) {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/attendance`,
            {
              withCredentials: true,
            }
          );
          const grouped = response.data?.students;
          if (grouped && typeof grouped === "object") {
            setStudentData(grouped);
          } else {
            // console.warn("❗Invalid student data received:", grouped);
            setStudentData({}); // prevent crash
          }
          setloadingCircle(false);
          return;
        }
        router.push("/login");
      } catch (error) {
        // console.error("❌ Error fetching student data:", error);
        setStudentData({}); // prevent crash
      }
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setDatetime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = (accNo: string, status: string) => {
    setStatusMap((prev) => ({ ...prev, [accNo]: status }));
  };

  const getSummary = () => {
    const values = Object.values(statusMap);
    const present = values.filter((v) => v === "present").length;
    const absent = values.filter((v) => v === "absent").length;
    return { present, absent };
  };

  const handleSave = async () => {
    const formattedRecords = Object.entries(studentData).flatMap(
      ([_, students]) =>
        students.map((student) => ({
          roomNo: student.roomNo,
          accountNumber: student.accNo,
          name: student.name,
          status: statusMap[student.accNo] || "present",
        }))
    );

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/attendance/mark`,
        { records: formattedRecords },
        { withCredentials: true }
      );
      router.push("/attendance-records");
    } catch (err) {
      // console.error("❌ Error saving attendance:", err);
      alert("❌ Failed to save attendance.");
    }
  };

  const { present, absent } = getSummary();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(statusMap).length > 0) {
        e.preventDefault();
        e.returnValue = ""; // Required for Chrome to show prompt
        // You cannot use alert() here — it will be blocked
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [statusMap]);

  return (
    <>
      {loadingCircle ? (
        <div className="h-screen w-screen flex items-center justify-center">
          <div className="flex gap-2">
            <div className="flex gap-3">
              <div className="h-7 w-7 border-4 border-t-green-500 border-b-white rounded-full animate-spin"></div>
            </div>
            <h1 className="text-2xl">Loading...</h1>
          </div>
        </div>
      ) : (
        <>
          {" "}
          <header className="mb-5">
            <div className="header-left">
              <img src="/logo.png" alt="Logo" />
              <h1 className="text-3xl font-bold">E-Attendance</h1>
            </div>
            <div id="datetime">
              {datetime &&
                datetime.toLocaleString("en-GB", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                  hour12: true,
                })}
            </div>
          </header>
          <button
            onClick={() => router.push("/ad-dashboard")}
            className="mb-4 px-4 py-2 rounded-lg border font-mono border-black bg-white text-black font-semibold transition hover:scale-105"
          >
            🔙 Back to Dashboard
          </button>
          <div id="attendance-container">
            {Object.entries(studentData).map(([room, students]) => (
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
                          className={`status-btn present ${statusMap[student.accNo] === "present"
                              ? "active"
                              : ""
                            }`}
                          onClick={() =>
                            handleStatusChange(
                              student.accNo.toString(),
                              "present"
                            )
                          }
                        >
                          P
                        </button>
                        <button
                          className={`status-btn absent ${statusMap[student.accNo] === "absent"
                              ? "active"
                              : ""
                            }`}
                          onClick={() =>
                            handleStatusChange(
                              student.accNo.toString(),
                              "absent"
                            )
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
          <button
            id="saveBtn"
            onClick={async () => {
              const confirmSave = window.confirm(
                "Do you want to save the attendance?"
              );
              if (confirmSave) {
                await handleSave();
              }
            }}
          >
            ✅ Save Attendance
          </button>
          <div id="summary">
            Total Present: {present} | Total Absent: {absent}
          </div>
        </>
      )}
    </>
  );
};

export default Page;
