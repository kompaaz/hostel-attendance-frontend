"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loading from "@/app/components/Loading";

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

const StudentLeave = () => {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        // ✅ Check auth
        const authRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/authenticate`,
          { withCredentials: true }
        );

        if (!authRes.data.isLoggedIn || authRes.data.role !== "student") {
          return router.push("/login");
        }

        // ✅ Fetch student
        const resStudent = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/me`,
          { withCredentials: true }
        );
        setStudent(resStudent.data);

        // ✅ Fetch leave history
        const resLeave = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/leave/my-requests`,
          { withCredentials: true }
        );
        setRequests(resLeave.data.leaves || []);

        setLoading(false);
      } catch (err) {
        console.log("❌ Failed to load leave page", err);
        router.push("/student/dashboard");
      }
    })();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/leave/apply`,
        { fromDate, toDate, reason },
        { withCredentials: true }
      );

      alert("Leave applied successfully");
      // Refresh the requests list
      const resLeave = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/leave/my-requests`,
        { withCredentials: true }
      );
      setRequests(resLeave.data.leaves || []);

      setFromDate("");
      setToDate("");
      setReason("");
    } catch (error: any) {
      alert(error.response?.data?.message || "Error applying leave");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved_by_director":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "pending":
      default:
        return "text-yellow-600";
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 font-mono">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-black mb-6">
          Leave Request
        </h2>

        {student && (
          <p className="text-sm text-black text-center mb-6 bg-gray-50 p-3 rounded-lg">
            <strong>Student:</strong> {student.name} |
            <strong> Account No:</strong> {student.accNo} |
            <strong> Room No:</strong> {student.roomNo}
          </p>
        )}

        {/* Leave Form */}
        <form
          onSubmit={handleApply}
          className="space-y-4 text-left bg-gray-50 p-5 rounded-xl border border-gray-200 mb-8"
        >
          <h3 className="text-xl font-semibold text-black mb-4">
            Apply for Leave
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-800 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
                className="border p-3 rounded w-full focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-800 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
                className="border p-3 rounded w-full focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-800 mb-2">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="border p-3 rounded w-full focus:ring-2 focus:ring-black focus:border-transparent"
              rows={3}
              placeholder="Please provide a reason for your leave..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-black text-white font-semibold transition hover:bg-gray-800 hover:scale-105 transform duration-200"
          >
            Apply for Leave
          </button>
        </form>

        {/* Leave History */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-black">
            My Leave Requests
          </h3>

          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="border p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                >
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
                      <p
                        className={`font-semibold ${getStatusColor(
                          req.status
                        )}`}
                      >
                        {getStatusText(req.status)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Applied On</p>
                      <p className="text-sm text-black">
                        {formatDate(req.appliedAt)}
                      </p>
                    </div>
                  </div>

                  {req.status === "rejected" && req.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-800">
                        Rejection Reason:
                      </p>
                      <p className="text-red-700">{req.rejectionReason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No leave requests yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Apply for your first leave above.
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push("/student/dashboard")}
          className="w-full py-3 rounded-lg bg-gray-800 text-white font-semibold transition hover:bg-black hover:scale-105 transform duration-200"
        >
          ⬅ Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default StudentLeave;
