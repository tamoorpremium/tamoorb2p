import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../../utils/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import { CheckCircle, XCircle, Clock, Link as LinkIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

// --- Interfaces and constants are preserved ---
interface CancellationRequest {
  id: number;
  order_id: number;
  user_id: string;
  reason?: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  requested_at: string; // Ensuring this field from your original code is present
}

const STATUS_UI: Record<string, { color: string; icon: React.ElementType }> = {
    pending: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: Clock },
    approved: { color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: CheckCircle },
    rejected: { color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: XCircle },
};

const AdminRequests: React.FC = () => {
  // --- All original state and logic are preserved ---
  const [requests, setRequests] = useState<CancellationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const navigate = useNavigate();

  // --- Using your original, working fetch logic EXACTLY ---
  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("order_cancellation_requests")
      .select("*")
      .order("requested_at", { ascending: false }); // Using your original 'requested_at'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Using your original, working action handler EXACTLY ---
  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      setProcessingId(id);

      if (action === "approve") {
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
              cancellation_request_id: id,
              admin_id: user.id,
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

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter(req => req.status === statusFilter);
  }, [requests, statusFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8 font-sans text-gray-100">
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-yellow-400/20">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-yellow-400 mb-4 sm:mb-0">
                Cancellation Requests
            </h1>
        </header>

        <div className="flex flex-wrap gap-2 mb-6">
            {(['pending', 'approved', 'rejected', 'all'] as const).map(status => (
                <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 border-2 ${statusFilter === status ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 border-gray-700'}`}
                >
                    <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusFilter === status ? 'bg-gray-800 text-yellow-300' : 'bg-gray-600 text-gray-200'}`}>
                        {status === 'all' ? requests.length : requests.filter(r => r.status === status).length}
                    </span>
                </button>
            ))}
        </div>

        <div className="p-4 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead className="bg-yellow-400/10 hidden md:table-header-group">
                        <tr className="text-yellow-300 uppercase tracking-wider text-xs">
                            <th className="p-3 text-left">Order ID</th>
                            <th className="p-3 text-left">User ID</th>
                            <th className="p-3 text-left">Reason</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-yellow-400/10">
                        {loading ? (
                            <tr><td colSpan={6} className="p-4"><div className="flex justify-center items-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div></div></td></tr>
                        ) : filteredRequests.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-16 text-gray-400">No {statusFilter === 'all' ? '' : statusFilter} requests found.</td></tr>
                        ) : (
                            filteredRequests.map((req) => {
                                const Icon = STATUS_UI[req.status].icon;
                                return (
                                <tr key={req.id} className="block md:table-row mb-4 md:mb-0 border md:border-none border-gray-700 rounded-lg p-4 md:p-0">
                                    <td className="p-3 md:table-cell font-bold text-lg md:text-base text-gray-100 block md:border-none border-b border-gray-700 md:pb-3 pb-3 mb-2" data-label="Order ID">
                                        <button onClick={() => navigate(`/admin/orders/${req.order_id}`)} className="flex items-center gap-2 hover:text-yellow-300 transition-colors">
                                            #{req.order_id} <LinkIcon size={14}/>
                                        </button>
                                    </td>
                                    <td className="p-3 md:table-cell text-sm text-gray-400 font-mono block" data-label="User ID">{req.user_id}</td>
                                    <td className="p-3 md:table-cell text-sm text-gray-300 block" data-label="Reason">{req.reason || "-"}</td>
                                    <td className="p-3 md:table-cell text-center block" data-label="Status">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${STATUS_UI[req.status].color}`}>
                                            <Icon size={12} />
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="p-3 md:table-cell text-sm text-gray-400 block" data-label="Date">{dayjs(req.created_at).format('DD MMM YYYY, hh:mm A')}</td>
                                    <td className="p-3 md:table-cell text-center block md:pt-3 pt-4" data-label="Actions">
                                        {req.status === "pending" && (
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleAction(req.id, "approve")} disabled={processingId === req.id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500 transition">
                                                    <CheckCircle size={16} /> {processingId === req.id ? "Processing..." : "Approve"}
                                                </button>
                                                <button onClick={() => handleAction(req.id, "reject")} disabled={processingId === req.id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-500 transition">
                                                    <XCircle size={16} /> {processingId === req.id ? "Processing..." : "Reject"}
                                                </button>
                                            </div>
                                        )}
                                        {req.status !== "pending" && <span className="text-xs text-gray-500">Actioned</span>}
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default AdminRequests;

