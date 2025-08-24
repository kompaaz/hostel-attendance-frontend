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
  leave?: boolean; // true if on leave
  status?: "present" | "absent" | "leave"; // frontend-only
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

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/authenticate`,
          { withCredentials: true }
        );
        const isLoggedIn = response.data.isLoggedIn;
        if (isLoggedIn) {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/attendance`,
            { withCredentials: true }
          );
          console.log(response)
          const grouped = response.data?.students;
          setStudentData(grouped && typeof grouped === "object" ? grouped : {});
          setloadingCircle(false);
          return;
        }
        router.push("/login");
      } catch (error) {
        setStudentData({});
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
    let present = 0, absent = 0, leave = 0;
    Object.values(studentData).forEach(students => {
      students.forEach(student => {
        if (student.status === "leave") leave++;
        else if (student.status === "absent") absent++;
        else present++;
      });
    });
    return { present, absent, leave };
  };


  const handleSave = async () => {
    const formattedRecords = Object.entries(studentData).flatMap(([_, students]) =>
      students.map(student => ({
        roomNo: student.roomNo,
        accountNumber: student.accNo,
        name: student.name,
        status: student.status, // present / absent / leave
      }))
    );



    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/attendance/mark`,
        { records: formattedRecords },
        { withCredentials: true }
      );
      router.push("/attendance-records");
    } catch (err) {
      alert("❌ Failed to save attendance.");
    }
  };

  const { present, absent, leave } = getSummary();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(statusMap).length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
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
                      className={`student-card ${student.leave ? "opacity-60 bg-gray-200" : ""}`}
                      key={student.accNo}
                    >
                      <div className="student-name">
                        {student.name} ({student.dNo}){" "}
                        {student.leave && <span className="text-red-500 font-bold">[On Leave]</span>}
                      </div>

                      {!student.leave && (
                        <div className="status-buttons">
                          <button
                            className={`status-btn present ${statusMap[student.accNo] === "present" ? "active" : ""}`}
                            onClick={() => handleStatusChange(student.accNo.toString(), "present")}
                          >
                            P
                          </button>
                          <button
                            className={`status-btn absent ${statusMap[student.accNo] === "absent" ? "active" : ""}`}
                            onClick={() => handleStatusChange(student.accNo.toString(), "absent")}
                          >
                            A
                          </button>
                        </div>
                      )}
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
            Total Present: {present} | Total Absent: {absent} | Total Leave: {leave}
          </div>
        </>
      )}
    </>
  );
};

export default Page;
