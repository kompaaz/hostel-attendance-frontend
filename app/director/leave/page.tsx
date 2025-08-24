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
    rejectionReason?: string;
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
    message?: string;
}

const DirectorLeave = () => {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});
    const router = useRouter();

    // Fetch all leave requests
    useEffect(() => {
        (async () => {
            try {
                // ✅ Check authentication
                const authRes = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/authenticate`,
                    { withCredentials: true }
                );

                if (!authRes.data.isLoggedIn || authRes.data.role !== "director") {
                    console.log("Not authenticated as director, redirecting to login");
                    return router.push("/login");
                }

                // ✅ Fetch leave requests with better error handling
                const resLeave = await axios.get<ApiResponse>(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/leave/all`,
                    {
                        withCredentials: true,
                        headers: {
                            'Cache-Control': 'no-cache', // Prevent caching
                            'Pragma': 'no-cache'
                        }
                    }
                );
                console.log(resLeave);
                if (resLeave.data.success) {
                    setRequests(resLeave.data.leaves || []);
                } else {
                    console.error("Failed to fetch leaves:", resLeave.data.message);
                    setRequests([]);
                }

                setLoading(false);
            } catch (err: any) {
                console.log("❌ Error loading leave page:", err);

                // ✅ Handle 304 status (Not Modified) differently
                if (err.response?.status === 304) {
                    console.log("Data not modified, using cached data");
                    setLoading(false);
                    return;
                }

                // ✅ Only redirect on actual authentication errors
                if (err.response?.status === 401 || err.response?.status === 403) {
                    router.push("/login");
                } else {
                    // For other errors, just show empty state but don't redirect
                    setRequests([]);
                    setLoading(false);
                }
            }


        })();
    }, [router]);

    const handleApprove = async (id: string) => {
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/leave/${id}/action`,
                { action: "approve" }, // ✅ Add action parameter
                { withCredentials: true }
            );
            setRequests((prev) =>
                prev.map((r) => (r._id === id ? { ...r, status: "approved_by_director" } : r))
            );
        } catch (error: any) {
            alert(error.response?.data?.message || "Error approving leave");
        }
    };

    const handleReject = async (id: string) => {
        try {
            if (!rejectionReason[id] || rejectionReason[id].trim() === "") {
                return alert("Please enter a rejection reason");
            }
            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/leave/${id}/action`,
                {
                    action: "reject", // ✅ Add action parameter
                    rejectionReason: rejectionReason[id]
                },
                { withCredentials: true }
            );
            setRequests((prev) =>
                prev.map((r) =>
                    r._id === id
                        ? { ...r, status: "rejected", rejectionReason: rejectionReason[id] }
                        : r
                )
            );
            setRejectionReason((prev) => ({ ...prev, [id]: "" }));
        } catch (error: any) {
            alert(error.response?.data?.message || "Error rejecting leave");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "approved_by_director":
                return "Approved";
            case "rejected":
                return "Rejected";
            case "pending":
            default:
                return "Pending";
        }
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
                    Manage Leave Requests
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
                                        <p className="font-medium text-black">{formatDate(req.fromDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">To</p>
                                        <p className="font-medium text-black">{formatDate(req.toDate)}</p>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <p className="text-sm text-gray-600">Reason</p>
                                    <p className="text-black">{req.reason}</p>
                                </div>

                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p
                                            className={`font-semibold ${req.status === "approved_by_director"
                                                ? "text-green-600"
                                                : req.status === "rejected"
                                                    ? "text-red-600"
                                                    : "text-yellow-600"
                                                }`}
                                        >
                                            {getStatusText(req.status)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Applied On</p>
                                        <p className="text-sm text-black">{formatDate(req.appliedAt)}</p>
                                    </div>
                                </div>

                                {req.status === "pending" && (
                                    <div className="flex flex-col md:flex-row gap-3 mt-4">
                                        <button
                                            onClick={() => handleApprove(req._id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Approve
                                        </button>
                                        <div className="flex-1 flex flex-col gap-2">
                                            <textarea
                                                placeholder="Rejection reason (required)..."
                                                value={rejectionReason[req._id] || ""}
                                                onChange={(e) =>
                                                    setRejectionReason((prev) => ({
                                                        ...prev,
                                                        [req._id]: e.target.value,
                                                    }))
                                                }
                                                className="border rounded-lg p-2 text-sm w-full"
                                                rows={2}
                                            />
                                            <button
                                                onClick={() => handleReject(req._id)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                disabled={!rejectionReason[req._id]?.trim()}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {req.status === "rejected" && req.rejectionReason && (
                                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                        <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                                        <p className="text-red-700">{req.rejectionReason}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">No pending leave requests</p>
                        <p className="text-sm text-gray-400 mt-2">
                            All leave requests have been processed or no requests have been submitted yet.
                        </p>
                    </div>
                )}

                {/* Back Button */}
                <button
                    onClick={() => router.push("/director/dashboard")}
                    className="mt-8 w-full py-3 rounded-lg bg-gray-800 text-white font-semibold transition hover:bg-black hover:scale-105 transform duration-200"
                >
                    ⬅ Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default DirectorLeave;