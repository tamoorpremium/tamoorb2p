// src/pages/OrderTracking.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import { Package, Truck, CreditCard, MapPin, FileText } from "lucide-react";

// ---------- Interfaces ----------
interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  weight: string;
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
  placed_at: string;
  status: string;
  total: number;
  items: OrderItem[];
  payment?: PaymentInfo | null;
  shipment?: ShipmentInfo | null;
  address?: any;
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

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const { data: orderData, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", id)
          .single();
        if (error || !orderData) throw error;

        const { data: itemsData } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", id);

        const { data: paymentData } = await supabase
          .from("payments")
          .select("*")
          .eq("order_id", id)
          .single();

        const { data: shipmentData } = await supabase
          .from("shipments")
          .select("*")
          .eq("order_id", id)
          .single();

        setOrder({
          ...orderData,
          items: itemsData || [],
          payment: paymentData || null,
          shipment: shipmentData || null,
        });
      } catch (err) {
        toast.error("❌ Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };
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

  if (loading) return <p className="text-center">Loading...</p>;
  if (!order) return <p className="text-center">Order not found</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream to-white pt-32">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mx-auto px-4 pb-20">
        <div className="luxury-card glass rounded-3xl p-10">
          <h1 className="text-5xl font-display font-bold mb-8 text-neutral-800">
            Order <span className="tamoor-gradient">#{order.id}</span>
          </h1>
          <p className="text-lg text-neutral-600 mb-8">
            Placed on {new Date(order.placed_at).toLocaleString()}
          </p>

          {/* Shipment Timeline */}
          <div className="mb-12">
            <h2 className="text-2xl font-display font-bold mb-4 flex items-center">
              <Truck className="w-6 h-6 mr-2 text-luxury-gold" /> Tracking Progress
            </h2>
            <div className="relative pl-8">
              <div className="absolute top-0 left-2 w-1 h-full bg-gradient-to-b from-luxury-gold/80 to-neutral-200 rounded-full"></div>
              <div className="space-y-6">
                {SHIPMENT_STEPS.map((step) => {
                  const isActive = order.shipment?.tracking_status === step;
                  return (
                    <div key={step} className="relative flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          isActive
                            ? "bg-luxury-gold border-luxury-gold shadow-lg"
                            : "bg-white border-neutral-400"
                        }`}
                      ></div>
                      <span
                        className={`ml-4 font-medium ${
                          isActive ? "text-luxury-gold" : "text-neutral-500"
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

          {/* Address */}
          <div className="luxury-card glass rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-display font-bold mb-4 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-luxury-gold" /> Customer Details
            </h2>
            <p><strong>{order.address?.full_name}</strong></p>
            <p>{order.address?.phone}</p>
            <p className="whitespace-pre-line text-neutral-600 mt-2">
              {[
                order.address?.address,
                order.address?.city,
                order.address?.state,
                order.address?.pincode,
              ].filter(Boolean).join("\n")}
            </p>
          </div>

          {/* Items */}
          <div className="luxury-card glass rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-display font-bold mb-4 flex items-center">
              <Package className="w-6 h-6 mr-2 text-luxury-gold" /> Items
            </h2>
            <div className="overflow-hidden rounded-2xl border border-neutral-200">
              <table className="w-full">
                <thead className="bg-luxury-gold/90 text-white">
                  <tr>
                    <th className="p-4 text-left">Product ID</th>
                    <th className="p-4 text-right">Qty</th>
                    <th className="p-4 text-right">Price (₹)</th>
                    <th className="p-4 text-right">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t border-neutral-200">
                      <td className="p-4">{item.product_id}</td>
                      <td className="p-4 text-right">{item.quantity}</td>
                      <td className="p-4 text-right">{item.price.toFixed(2)}</td>
                      <td className="p-4 text-right">{item.weight}</td>
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
              <p><strong>Method:</strong> {order.payment.payment_method}</p>
              <p><strong>Status:</strong> {order.payment.payment_status}</p>
              <p><strong>Txn ID:</strong> {order.payment.transaction_id}</p>
              <p><strong>Amount:</strong> ₹{order.payment.amount.toFixed(2)}</p>
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

          <div className="flex items-center justify-between mt-10">
            <p className="text-2xl font-display font-bold tamoor-gradient">
              Total: ₹{order.total.toFixed(2)}
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="btn-premium px-8 py-3 rounded-full"
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
