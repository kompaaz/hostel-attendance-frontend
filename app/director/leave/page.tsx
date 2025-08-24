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
    const [showCompleted, setShowCompleted] = useState(false);
    const router = useRouter();

    // Filter requests based on toggle
    const pendingRequests = requests.filter(req => req.status === "pending");
    const completedRequests = requests.filter(req => req.status !== "pending");
    const displayedRequests = showCompleted ? requests : pendingRequests;

    // Fetch all leave requests
    useEffect(() => {
        (async () => {
            try {
                const authRes = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/authenticate`,
                    { withCredentials: true }
                );

                if (!authRes.data.isLoggedIn || authRes.data.role !== "director") {
                    return router.push("/login");
                }

                const resLeave = await axios.get<ApiResponse>(
                    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/leave/all`,
                    { withCredentials: true }
                );

                if (resLeave.data.success) {
                    setRequests(resLeave.data.leaves || []);
                }
                setLoading(false);
            } catch (err: any) {
                console.log("Error loading leave page:", err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    router.push("/login");
                } else {
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
                { action: "approve" },
                { withCredentials: true }
            );
            setRequests(prev => prev.map(r =>
                r._id === id ? { ...r, status: "approved_by_director" } : r
            ));
        } catch (error: any) {
            alert(error.response?.data?.message || "Error approving leave");
        }
    };

    const handleReject = async (id: string) => {
        try {
            if (!rejectionReason[id]?.trim()) {
                return alert("Please enter a rejection reason");
            }
            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/leave/${id}/action`,
                { action: "reject", rejectionReason: rejectionReason[id] },
                { withCredentials: true }
            );
            setRequests(prev => prev.map(r =>
                r._id === id ? { ...r, status: "rejected", rejectionReason: rejectionReason[id] } : r
            ));
            setRejectionReason(prev => ({ ...prev, [id]: "" }));
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

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 rounded text-xs font-medium";
        switch (status) {
            case "approved_by_director":
                return <span className={`${baseClasses} bg-green-100 text-green-800`}>Approved</span>;
            case "rejected":
                return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>;
            default:
                return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 border-2 border-t-blue-500 border-b-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
                            <p className="text-gray-600 mt-1">Manage student leave applications</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="show-completed"
                                    checked={showCompleted}
                                    onChange={(e) => setShowCompleted(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label htmlFor="show-completed" className="ml-2 text-sm text-gray-700">
                                    Show completed
                                </label>
                            </div>
                            <button
                                onClick={() => router.push("/director/dashboard")}
                                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                ← Dashboard
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
                        <div className="text-sm text-gray-600">Total Requests</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
                        <div className="text-sm text-gray-600">Pending</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{completedRequests.length}</div>
                        <div className="text-sm text-gray-600">Processed</div>
                    </div>
                </div>

                {/* Requests List */}
                {displayedRequests.length > 0 ? (
                    <div className="space-y-4">
                        {displayedRequests.map((req) => (
                            <div key={req._id} className="bg-white rounded-lg shadow-sm p-6">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {req.student?.name || "Unknown Student"}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {req.student?.accNo && `Acc: ${req.student.accNo}`}
                                            {req.student?.roomNo && ` • Room: ${req.student.roomNo}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(req.status)}
                                        <span className="text-sm text-gray-500">
                                            {formatDate(req.appliedAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">From: </span>
                                        <span className="text-sm text-gray-900">{formatDate(req.fromDate)}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">To: </span>
                                        <span className="text-sm text-gray-900">{formatDate(req.toDate)}</span>
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Reason</p>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{req.reason}</p>
                                </div>

                                {/* Actions for pending requests */}
                                {req.status === "pending" && (
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                                        <button
                                            onClick={() => handleApprove(req._id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                                        >
                                            Approve
                                        </button>
                                        <div className="flex-1 flex flex-col gap-2">
                                            <textarea
                                                placeholder="Rejection reason..."
                                                value={rejectionReason[req._id] || ""}
                                                onChange={(e) => setRejectionReason(prev => ({
                                                    ...prev,
                                                    [req._id]: e.target.value
                                                }))}
                                                className="w-full p-2 border rounded-md text-sm resize-none"
                                                rows={2}
                                            />
                                            <button
                                                onClick={() => handleReject(req._id)}
                                                disabled={!rejectionReason[req._id]?.trim()}
                                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Rejection reason for rejected requests */}
                                {req.status === "rejected" && req.rejectionReason && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-red-700 mb-1">Rejection Reason</p>
                                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
                                            {req.rejectionReason}
                                        </p>
                                    </div>
                                )}

                                {/* Approval info for approved requests */}
                                {req.status === "approved_by_director" && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-green-700">✓ Approved</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="text-gray-400 mb-2">📋</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {showCompleted ? "No processed requests" : "No pending requests"}
                        </h3>
                        <p className="text-gray-600">
                            {showCompleted
                                ? "All leave requests are still pending review."
                                : "Great job! All requests have been processed."
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DirectorLeave;