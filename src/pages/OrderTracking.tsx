// src/pages/OrderTracking.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import {
  Package,
  Truck,
  CreditCard,
  MapPin,
  FileText,
  X,
  Clock,
} from "lucide-react";

// ---------- Interfaces ----------
interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  weight: string;
  products?: {
    name: string;
  };
}
interface PaymentInfo {
  payment_method: string;
  payment_status: string;
  transaction_id: string;
  amount: number;
  paid_at?: string;
}
interface ShipmentInfo {
  shipment_id: string | null;
  tracking_id: string | null;
  courier_company: string | null;
  tracking_status: string | null;
  awb_no: string | null;
  last_tracking_update?: string;
}
interface OrderDetails {
  id: number;
  user_id: string;
  placed_at: string;
  status: string;
  total: number;
  items: OrderItem[];
  payment?: PaymentInfo | null;
  shipment?: ShipmentInfo | null;
  address?: any;
  cancel_request_status?: string | null;
}

// ---------- Constants ----------
const SHIPMENT_STEPS = [
  "Packed",
  "Picked",
  "Shipped",
  "Out for Delivery",
  "Arriving Early",
  "Delivery Delayed",
  "Delivered",
];
const SHIPMENT_COLORS: Record<string, string> = {
  Packed: "bg-purple-600",
  Picked: "bg-blue-500",
  Shipped: "bg-orange-500",
  "Out for Delivery": "bg-indigo-600",
  "Arriving Early": "bg-green-500",
  "Delivery Delayed": "bg-red-600",
  Delivered: "bg-green-800",
};
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // -------- fetch order ----------
  const fetchOrder = async () => {
  if (!id) return;
  setLoading(true);
  const orderId = Number(id); // convert to integer

  try {
    // Fetch main order
    const { data: orderData, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (error || !orderData) throw error;

    // Fetch order items
    const { data: itemsData, error: itemsError } = await supabase
      .from("order_items")
      .select(`id, product_id, quantity, price, weight, products ( name )`)
      .eq("order_id", orderId);
    if (itemsError) throw itemsError;

    // Fetch payment info
    const { data: paymentData } = await supabase
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .single();

    // Fetch shipment info
    const { data: shipmentData } = await supabase
      .from("shipments")
      .select("*")
      .eq("order_id", orderId)
      .single();

    // Fetch latest cancellation request
    const { data: cancelReqData, error: cancelReqError } = await supabase
      .from("order_cancellation_requests")
      .select("status")
      .eq("order_id", orderId)
      .order("id", { ascending: false }) // use 'id' instead of 'created_at'
      .limit(1);


    if (cancelReqError) console.error("Error fetching cancellation request:", cancelReqError);

    const latestCancelRequest = cancelReqData?.[0] || null;

    // Set state
    setOrder({
      ...orderData,
      items: itemsData || [],
      payment: paymentData || null,
      shipment: shipmentData || null,
      cancel_request_status: latestCancelRequest?.status || null,
    });
  } catch (err) {
    console.error(err);
    toast.error("❌ Failed to fetch order");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchOrder();
  }, [id]);


  const downloadInvoice = async () => {
    if (!order) return;
    if (order.status !== "delivered") {
      toast.info(
        "Invoice will be available after delivery. Contact tamoorpremium@gmail.com for help."
      );
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE}/api/get-invoice-link?orderId=${order.id}`
      );
      if (!res.ok) throw new Error("Invoice not found");
      const { url } = await res.json();
      window.open(url, "_blank");
    } catch (err) {
      toast.error("❌ Failed to download invoice");
    }
  };

  const handleCancelOrder = async () => {
  if (!order) return;

  // Prevent duplicate requests
  if (order.cancel_request_status === "pending" || order.cancel_request_status === "approved") {
    toast.info("Cancellation request already submitted.");
    return;
  }

  const userId = order.user_id;
  if (!userId) {
    toast.error("❌ User ID missing");
    return;
  }

  setCanceling(true);

  try {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-order`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          userId: userId,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Edge function failed with ${res.status}`);
    }

    toast.success("✅ Cancellation request submitted");
    setOrder({ ...order, cancel_request_status: "pending" });
  } catch (err: any) {
    console.error(err);
    toast.error(`❌ ${err.message || "Failed to submit cancellation"}`);
  } finally {
    setCanceling(false);
  }
};




  if (loading) return <p className="text-center">Loading...</p>;
  if (!order) return <p className="text-center">Order not found</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-32">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mx-auto px-4 pb-20">
        <div className="luxury-card glass rounded-3xl p-10 sm:p-6">
          <h1 className="text-3xl sm:text-5xl font-display font-bold mb-8 text-neutral-800">
            Order <span className="tamoor-gradient">#{order.id}</span>
          </h1>
          <p className="text-lg text-neutral-600 mb-8 flex items-center gap-2">
            <Clock className="w-5 h-5 text-luxury-gold" />
            Placed on {new Date(order.placed_at).toLocaleString()}
          </p>

          {/* Shipment Timeline */}
          <div className="mb-12">
            <h2 className="text-2xl font-display font-bold mb-4 flex items-center">
              <Truck className="w-6 h-6 mr-2 text-luxury-gold" /> Tracking
              Progress
            </h2>
            <div className="relative pl-6 sm:pl-8">
              <div className="absolute top-0 left-2 w-1 h-full bg-gradient-to-b from-luxury-gold/80 to-neutral-200 rounded-full"></div>
              <div className="space-y-6">
                {SHIPMENT_STEPS.map((step) => {
                  const isActive = order.shipment?.tracking_status === step;
                  const isCompleted =
                    SHIPMENT_STEPS.indexOf(step) <=
                    SHIPMENT_STEPS.indexOf(order.shipment?.tracking_status || "");
                  return (
                    <div key={step} className="relative flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                          isActive
                            ? "bg-luxury-gold border-luxury-gold shadow-lg"
                            : isCompleted
                            ? `${SHIPMENT_COLORS[step]} border-transparent`
                            : "bg-white border-neutral-400"
                        }`}
                      ></div>
                      <span
                        className={`ml-4 font-medium ${
                          isActive
                            ? "text-luxury-gold"
                            : isCompleted
                            ? "text-neutral-800"
                            : "text-neutral-400"
                        }`}
                      >
                        {step}
                      </span>
                      {isActive && (
                        <span className="ml-2 text-xs font-semibold text-luxury-gold">
                          Current
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CANCEL BUTTON / CANCELLATION STATUS */}
          {order.status !== "delivered" && (
            <div className="mb-6">
              {order.status === "cancelled" ? (
                <span className="text-red-600 font-semibold">
                  Order Cancelled
                </span>
              ) : order.cancel_request_status === "pending" ? (
                <span className="text-orange-600 font-semibold">
                  Cancellation Request Pending
                </span>
              ) : order.cancel_request_status === "approved" ? (
                <span className="text-green-600 font-semibold">
                  Cancellation Approved
                </span>
              ) : (
                <button
                  onClick={handleCancelOrder}
                  disabled={canceling}
                  className="btn-premium flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  {canceling ? "Cancelling..." : "Cancel Order"}
                </button>
              )}
            </div>
          )}

          {/* Shipment Details */}
          {order.shipment && (
            <div className="luxury-card glass rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-display font-bold mb-4 text-luxury-gold">
                Shipment Details
              </h2>
              <p>
                <strong>Shipment ID:</strong>{" "}
                {order.shipment.shipment_id || "N/A"}
              </p>
              <p>
                <strong>Tracking ID:</strong>{" "}
                {order.shipment.tracking_id || "N/A"}
              </p>
              <p className="break-words">
                <strong>Courier Company:</strong>{" "}
                {order.shipment.courier_company || "N/A"}
              </p>
              <p>
                <strong>AWB No:</strong> {order.shipment.awb_no || "N/A"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {order.shipment.tracking_status || "N/A"}
              </p>
              {order.shipment.last_tracking_update && (
                <p>
                  <strong>Last Update:</strong>{" "}
                  {new Date(
                    order.shipment.last_tracking_update
                  ).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Address */}
          <div className="luxury-card glass rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-display font-bold mb-4 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-luxury-gold" /> Customer
              Details
            </h2>
            <p>
              <strong>{order.address?.full_name}</strong>
            </p>
            <p>{order.address?.phone}</p>
            <p className="whitespace-pre-line text-neutral-600 mt-2">
              {[
                order.address?.address,
                order.address?.city,
                order.address?.state,
                order.address?.pincode,
              ]
                .filter(Boolean)
                .join("\n")}
            </p>
          </div>

          {/* Items */}
          <div className="luxury-card glass rounded-2xl p-6 mb-8 overflow-x-auto">
            <h2 className="text-2xl font-display font-bold mb-4 flex items-center">
              <Package className="w-6 h-6 mr-2 text-luxury-gold" /> Items
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-neutral-200">
              <table className="w-full min-w-[500px]">
                <thead className="bg-luxury-gold/90 text-white">
                  <tr>
                    <th className="p-4 text-left">Product</th>
                    <th className="p-4 text-right">Qty</th>
                    <th className="p-4 text-right">Price (₹)</th>
                    <th className="p-4 text-right">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-neutral-200 text-sm sm:text-base"
                    >
                      <td className="p-4">
                        {item.products?.name || "Unknown Product"}
                      </td>
                      <td className="p-4 text-right">{item.quantity}</td>
                      <td className="p-4 text-right">
                        {item.price.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">{item.weight} grams</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment */}
          {order.payment && (
            <div className="luxury-card glass rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-display font-bold mb-4 flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-luxury-gold" /> Payment
              </h2>
              <p>
                <strong>Method:</strong> {order.payment.payment_method}
              </p>
              <p>
                <strong>Status:</strong> {order.payment.payment_status}
              </p>
              <p>
                <strong>Txn ID:</strong> {order.payment.transaction_id}
              </p>
              <p>
                <strong>Amount:</strong> ₹{order.payment.amount.toFixed(2)}
              </p>
            </div>
          )}

          {/* Invoice */}
          <div className="luxury-card glass rounded-2xl p-6">
            <h2 className="text-2xl font-display font-bold mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-luxury-gold" /> Invoice
            </h2>
            <button onClick={downloadInvoice} className="btn-premium mt-3">
              Download Invoice
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-10 gap-4">
            <p className="text-2xl font-display font-bold tamoor-gradient">
              Total: ₹{order.total.toFixed(2)}
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="btn-premium px-6 sm:px-8 py-3 rounded-full"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
