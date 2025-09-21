// src/pages/admin/AdminRequests.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { toast } from "react-toastify";
import { CheckCircle, XCircle } from "lucide-react";

interface CancellationRequest {
  id: number;
  order_id: number;
  user_id: string;
  reason?: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<CancellationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("order_cancellation_requests")
      .select("*")
      .order("requested_at", { ascending: false }); // or "created_at" if your column exists

    if (error) {
      console.error("Error fetching requests:", error);
      toast.error("Error fetching requests");
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      setProcessingId(id);

      if (action === "approve") {
        // Get current admin ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Admin not authenticated");

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/approve-cancel-refund`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cancellation_request_id: id, // snake_case
              admin_id: user.id,           // snake_case
            }),
          }
        );

        const data = await res.json();
        if (!res.ok || data?.error) {
          throw new Error(data?.error || `Edge function failed with status ${res.status}`);
        }

        toast.success("✅ Request approved successfully");
      } else {
        const { error } = await supabase
          .from("order_cancellation_requests")
          .update({ status: "rejected" })
          .eq("id", id);

        if (error) throw error;
        toast.info("Request rejected");
      }

      await fetchRequests();
    } catch (err: any) {
      console.error("Action failed:", err);
      toast.error(`Action failed: ${err.message || JSON.stringify(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Cancellation & Refund Requests</h1>

      {loading ? (
        <p className="text-white">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-white">No requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">Order ID</th>
                <th className="border p-2">User ID</th>
                <th className="border p-2">Reason</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Created At</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="border p-2 text-white">{req.id}</td>
                  <td className="border p-2 text-white">{req.order_id}</td>
                  <td className="border p-2 text-white">{req.user_id}</td>
                  <td className="border p-2 text-white">{req.reason || "-"}</td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        req.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : req.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="border p-2">{new Date(req.created_at).toLocaleString()}</td>
                  <td className="border p-2 flex gap-2">
                    {req.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(req.id, "approve")}
                          disabled={processingId === req.id}
                          className={`flex items-center gap-1 px-3 py-1 rounded text-white ${
                            processingId === req.id
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          <CheckCircle size={16} /> {processingId === req.id ? "Processing..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "reject")}
                          disabled={processingId === req.id}
                          className={`flex items-center gap-1 px-3 py-1 rounded text-white ${
                            processingId === req.id
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600"
                          }`}
                        >
                          <XCircle size={16} /> {processingId === req.id ? "Processing..." : "Reject"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
