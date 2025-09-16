// src/pages/OrderTracking.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { toast, ToastContainer } from "react-toastify";

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

// ---------- Component ----------
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
        "Invoice will be available after the order is successfully delivered. If still facing issues contact support team at tamoorpremium@gmail.com"
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
    <section className="relative min-h-screen bg-gradient-to-br from-luxury-cream via-white to-luxury-cream-dark py-20">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-4xl mx-auto glass luxury-card p-10 rounded-3xl shadow-xl">
        <h1 className="text-3xl font-display font-bold mb-6">Order Details</h1>

        {/* Order Info */}
        <p>
          <strong>Order ID:</strong> {order.id}
        </p>
        <p>
          <strong>Order Date:</strong>{" "}
          {new Date(order.placed_at).toLocaleString()}
        </p>

        {/* Customer Info */}
        <div className="mt-6">
          <h2 className="font-semibold text-xl">Customer Details</h2>
          <p>
            <strong>Name:</strong> {order.address?.full_name}
          </p>
          <p>
            <strong>Phone:</strong> {order.address?.phone}
          </p>
          <p>
            <strong>Address:</strong>
          </p>
          <address className="whitespace-pre-line ml-4">
            {[
              order.address?.address,
              order.address?.city,
              order.address?.state,
              order.address?.pincode,
            ]
              .filter(Boolean)
              .join("\n")}
          </address>
        </div>

        {/* Items */}
        <div className="mt-6">
          <h2 className="font-semibold text-xl">Items</h2>
          <table className="w-full mt-2 border border-gray-200 rounded-lg">
            <thead className="bg-luxury-gold-light text-white">
              <tr>
                <th className="p-3 text-left">Product ID</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3 text-right">Price (₹)</th>
                <th className="p-3 text-right">Weight</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{item.product_id}</td>
                  <td className="p-3 text-right">{item.quantity}</td>
                  <td className="p-3 text-right">{item.price.toFixed(2)}</td>
                  <td className="p-3 text-right">{item.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Shipment */}
        <div className="mt-6">
          <h2 className="font-semibold text-xl">Shipment Details</h2>
          <p>
            <strong>Shipment ID:</strong>{" "}
            {order.shipment?.shipment_id || "N/A"}
          </p>
          <p>
            <strong>Tracking ID:</strong>{" "}
            {order.shipment?.tracking_id || "N/A"}
          </p>
          <p>
            <strong>Courier:</strong> {order.shipment?.courier_company || "N/A"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {order.shipment?.tracking_status || "N/A"}
          </p>

          {/* Shipment Tracking Timeline */}
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Tracking Progress</h3>
            <div className="space-y-3">
              {SHIPMENT_STEPS.map((step) => {
                const isActive = order.shipment?.tracking_status === step;
                return (
                  <div
                    key={step}
                    className={`flex items-center justify-between p-3 rounded-xl neomorphism transition ${
                      isActive
                        ? `${SHIPMENT_COLORS[step]} text-white`
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <span>{step}</span>
                    {isActive && (
                      <span className="text-sm font-semibold">Current</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Payment */}
        {order.payment && (
          <div className="mt-6">
            <h2 className="font-semibold text-xl">Payment Details</h2>
            <p>
              <strong>Method:</strong> {order.payment.payment_method}
            </p>
            <p>
              <strong>Status:</strong> {order.payment.payment_status}
            </p>
            <p>
              <strong>Transaction ID:</strong> {order.payment.transaction_id}
            </p>
            <p>
              <strong>Amount:</strong> ₹{order.payment.amount.toFixed(2)}
            </p>
          </div>
        )}

        {/* Invoice */}
        <div className="mt-6">
          <h2 className="font-semibold text-xl">Invoice</h2>
          <button onClick={downloadInvoice} className="btn-premium mt-3">
            Download Invoice
          </button>
        </div>

        <p className="mt-6 font-semibold">
          Total Amount: ₹{order.total.toFixed(2)}
        </p>
        <button onClick={() => navigate("/profile")} className="btn-premium mt-6">
          Back to Orders
        </button>
      </div>
    </section>
  );
};

export default OrderTracking;
