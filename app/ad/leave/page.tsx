"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface LeaveRequest {
    _id: string;
    fromDate: string;
    toDate: string;
    reason: string;
    status: "pending" | "approved_by_director" | "rejected";
    appliedAt: string;
    student?: {
        name: string;
        accNo: string;
        roomNo: string;
    };
}

interface ApiResponse {
    success: boolean;
    leaves: LeaveRequest[];
}

const ADLeave = () => {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                // ✅ check auth
                const authRes = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/authenticate`,
                    { withCredentials: true }
                );

                if (!authRes.data.isLoggedIn || authRes.data.role !== "ad") {
                    return router.push("/login");
                }

                // ✅ fetch only director-approved requests for this AD
                const res = await axios.get<ApiResponse>(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/leave/ad/leaves`,
                    { withCredentials: true }
                );

                console.log(res)

                setRequests(res.data.leaves || []);
                setLoading(false);
            } catch (err) {
                console.error("❌ Error fetching AD leave list", err);
                // router.push("/ad/dashboard");
            }
        })();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

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
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 font-mono">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-6">
                    Approved Leave Requests
                </h2>

                {requests.length > 0 ? (
                    <div className="space-y-4">
                        {requests.map((req) => (
                            <div
                                key={req._id}
                                className="border p-5 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="mb-3">
                                    <p className="text-sm text-gray-600">Student</p>
                                    <p className="font-medium text-black">
                                        {req.student?.name || "Unknown Student"}
                                        {req.student?.accNo && ` (${req.student.accNo})`}
                                        {req.student?.roomNo && ` - Room ${req.student.roomNo}`}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <p className="text-sm text-gray-600">From</p>
                                        <p className="font-medium text-black">
                                            {formatDate(req.fromDate)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">To</p>
                                        <p className="font-medium text-black">
                                            {formatDate(req.toDate)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <p className="text-sm text-gray-600">Reason</p>
                                    <p className="text-black">{req.reason}</p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className="font-semibold text-green-600">Approved</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Applied On</p>
                                        <p className="text-sm text-black">
                                            {formatDate(req.appliedAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">
                            No approved leave requests yet
                        </p>
                    </div>
                )}

                {/* Back Button */}
                <button
                    onClick={() => router.push("/ad/dashboard")}
                    className="mt-8 w-full py-3 rounded-lg bg-gray-800 text-white font-semibold transition hover:bg-black hover:scale-105 transform duration-200"
                >
                    ⬅ Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default ADLeave;
