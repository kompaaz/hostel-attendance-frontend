"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import "../../styles/attendance.css";

type Student = {
    _id: string;
    name: string;
    dNo: string;
    accNo: number;
    roomNo: string;
    block: string;
};

type StudentData = {
    [room: string]: Student[];
};

const Page = () => {
    const router = useRouter();
    const [studentData, setStudentData] = useState<StudentData>({});
    const [loadingCircle, setLoadingCircle] = useState(true);
    const [saving, setSaving] = useState(false);
    const [roomEdits, setRoomEdits] = useState<Record<string, { roomNo: string; block: string }>>(
        {}
    );

    useEffect(() => {
        (async () => {
            try {
                const authRes = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/authenticate`,
                    { withCredentials: true }
                );
                if (!authRes.data.isLoggedIn) return router.push("/login");

                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/students`,
                    { withCredentials: true }
                );
                setStudentData(res.data?.students || {});
                setLoadingCircle(false);
            } catch (err) {
                console.error("Error fetching students", err);
                setStudentData({});
            }
        })();
    }, [router]);

    const handleInputChange = (id: string, field: "roomNo" | "block", value: string) => {
        setRoomEdits((prev) => ({
            ...prev,
            [id]: { ...prev[id], [field]: value },
        }));
    };

    const handleSave = async (studentId: string) => {
        if (saving) return;
        setSaving(true);

        const edit = roomEdits[studentId];
        if (!edit || !edit.roomNo) {
            alert("⚠️ Please provide room number");
            setSaving(false);
            return;
        }

        try {
            const payload: any = {
                studentId,
                newRoomNo: edit.roomNo,
            };

            // only send newBlock if user typed something
            if (edit.block && edit.block.trim() !== "") {
                payload.newBlock = edit.block;
            }

            const res = await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/students/update-room`,
                payload,
                { withCredentials: true }
            );
            alert(res.data.message);

            // ✅ Refresh list
            const refreshed = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/students`,
                { withCredentials: true }
            );
            setStudentData(refreshed.data?.students || {});
            setRoomEdits({});
        } catch (err: any) {
            const message = err.response?.data?.error || "❌ Failed to update room.";
            alert(message);
        } finally {
            setSaving(false);
        }
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
                <>
                    <header className="mb-5">
                        <div className="header-left">
                            <img src="/logo.png" alt="Logo" />
                            <h1 className="text-3xl font-bold">Update Rooms</h1>
                        </div>
                    </header>
                    <button
                        onClick={() => router.push("/ad/dashboard")}
                        className="mb-4 px-4 py-2 rounded-lg border font-mono border-black bg-white text-black font-semibold transition hover:scale-105"
                    >
                        🔙 Back to Dashboard
                    </button>

                    <div id="attendance-container">
                        {Object.entries(studentData)
                            .sort(([roomA], [roomB]) => {
                                const [blockA, roomNoA] = roomA.split("-");
                                const [blockB, roomNoB] = roomB.split("-");
                                if (blockA < blockB) return -1;
                                if (blockA > blockB) return 1;
                                return Number(roomNoA) - Number(roomNoB);
                            })
                            .map(([room, students]) => {
                                const [block, roomNo] = room.split("-");
                                return (
                                    <div className="room-card" key={room}>
                                        <div className="room-title">
                                            Block {block}, Room {roomNo}
                                        </div>

                                        <div className="student-list">
                                            {students.map((student) => (
                                                <div className="student-card" key={student._id}>
                                                    <div className="student-name">
                                                        {student.name} ({student.dNo})
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Block"
                                                            className="border px-2 py-1 rounded w-20"
                                                            value={roomEdits[student._id]?.block || student.block}
                                                            onChange={(e) =>
                                                                handleInputChange(student._id, "block", e.target.value)
                                                            }
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Room"
                                                            className="border px-2 py-1 rounded w-24"
                                                            value={roomEdits[student._id]?.roomNo || student.roomNo}
                                                            onChange={(e) =>
                                                                handleInputChange(student._id, "roomNo", e.target.value)
                                                            }
                                                        />
                                                        <button
                                                            className={`px-3 py-1 rounded font-semibold ${saving
                                                                ? "bg-gray-400 cursor-not-allowed"
                                                                : "bg-green-500 hover:scale-105"
                                                                }`}
                                                            disabled={saving}
                                                            onClick={() => handleSave(student._id)}
                                                        >
                                                            {saving ? "⏳ Saving..." : "💾 Save"}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </>
            )}
        </>
    );
};

export default Page;
