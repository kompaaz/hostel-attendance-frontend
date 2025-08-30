"use client";
import { useEffect, useState } from "react";
import axios from "axios";

type Student = {
    _id: string;
    name: string;
    dNo: string;
    accNo: number;
    roomNo: string;
    block?: string;
};

const Page = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [updates, setUpdates] = useState<Record<string, { roomNo: string; block?: string }>>({});

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/students`, // <-- adjust if needed
                    { withCredentials: true }
                );
                setStudents(res.data.students);
            } catch (err) {
                console.error("❌ Failed fetching students", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const handleChange = (id: string, field: "roomNo" | "block", value: string) => {
        setUpdates((prev) => ({
            ...prev,
            [id]: { ...prev[id], [field]: value },
        }));
    };

    const handleSave = async () => {
        try {
            const payload = Object.entries(updates).map(([studentId, data]) => ({
                studentId,
                newRoomNo: data.roomNo,
                newBlock: data.block,
            }));

            await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/students/bulk-update-rooms`,
                { updates: payload },
                { withCredentials: true }
            );

            alert("✅ Room numbers updated successfully");
            setUpdates({});
        } catch (err: any) {
            console.error("❌ Failed to update rooms", err);
            alert(err.response?.data?.error || "Server error while updating rooms");
        }
    };

    if (loading) return <p className="p-5 text-lg">Loading students...</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Manage Students (Update Room No)</h1>

            <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Acc No</th>
                        <th className="p-2 border">Dept</th>
                        <th className="p-2 border">Block</th>
                        <th className="p-2 border">Room No</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => {
                        const update = updates[student._id] || {};
                        return (
                            <tr key={student._id} className="odd:bg-white even:bg-gray-50">
                                <td className="p-2 border">{student.name}</td>
                                <td className="p-2 border">{student.accNo}</td>
                                <td className="p-2 border">{student.dNo}</td>
                                <td className="p-2 border">
                                    <input
                                        type="text"
                                        value={update.block ?? student.block ?? ""}
                                        onChange={(e) => handleChange(student._id, "block", e.target.value)}
                                        className="border rounded px-2 py-1 w-20"
                                    />
                                </td>
                                <td className="p-2 border">
                                    <input
                                        type="text"
                                        value={update.roomNo ?? student.roomNo}
                                        onChange={(e) => handleChange(student._id, "roomNo", e.target.value)}
                                        className="border rounded px-2 py-1 w-20"
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <button
                onClick={handleSave}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={Object.keys(updates).length === 0}
            >
                💾 Save Changes
            </button>
        </div>
    );
};

export default Page;
