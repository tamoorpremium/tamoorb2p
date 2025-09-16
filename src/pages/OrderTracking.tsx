// src/pages/OrderTracking.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  FileText,
  ArrowLeft,
} from "lucide-react";

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

  if (loading)
    return (
      <p className="text-center text-lg font-medium animate-pulse text-luxury-gold">
        Loading your order...
      </p>
    );
  if (!order)
    return (
      <p className="text-center text-lg font-medium text-red-500">
        Order not found
      </p>
    );

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-luxury-cream via-white to-luxury-cream-dark py-20 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-5xl mx-auto glass backdrop-blur-xl p-10 rounded-3xl shadow-[10px_10px_30px_rgba(0,0,0,0.15),-10px_-10px_30px_rgba(255,255,255,0.6)] border border-white/30">
        <h1 className="text-4xl font-display font-bold text-center text-luxury-gold drop-shadow-md mb-10">
          Order Tracking
        </h1>

        {/* Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-white/60 shadow-neumorph border border-white/40">
            <div className="flex items-center gap-2 mb-3 text-luxury-gold">
              <Package /> <h2 className="font-semibold text-xl">Order Info</h2>
            </div>
            <p>
              <strong>Order ID:</strong> #{order.id}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(order.placed_at).toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className="capitalize">{order.status}</span>
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/60 shadow-neumorph border border-white/40">
            <div className="flex items-center gap-2 mb-3 text-luxury-gold">
              <MapPin />{" "}
              <h2 className="font-semibold text-xl">Customer Details</h2>
            </div>
            <p>
              <strong>Name:</strong> {order.address?.full_name}
            </p>
            <p>
              <strong>Phone:</strong> {order.address?.phone}
            </p>
            <p className="whitespace-pre-line">
              {[
                order.address?.address,
                order.address?.city,
                order.address?.state,
                order.address?.pincode,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="p-6 rounded-2xl bg-white/60 shadow-neumorph border border-white/40 mb-8">
          <div className="flex items-center gap-2 mb-3 text-luxury-gold">
            <FileText /> <h2 className="font-semibold text-xl">Items</h2>
          </div>
          <table className="w-full mt-2 border border-white/40 rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-luxury-gold to-yellow-400 text-white">
              <tr>
                <th className="p-3 text-left">Product ID</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3 text-right">Price (₹)</th>
                <th className="p-3 text-right">Weight</th>
              </tr>
            </thead>
            <tbody className="bg-white/40">
              {order.items.map((item) => (
                <tr key={item.id} className="border-t border-white/30">
                  <td className="p-3">{item.product_id}</td>
                  <td className="p-3 text-right">{item.quantity}</td>
                  <td className="p-3 text-right">
                    {item.price.toFixed(2)}
                  </td>
                  <td className="p-3 text-right">{item.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Shipment */}
        <div className="p-6 rounded-2xl bg-white/60 shadow-neumorph border border-white/40 mb-8">
          <div className="flex items-center gap-2 mb-3 text-luxury-gold">
            <Truck /> <h2 className="font-semibold text-xl">Shipment</h2>
          </div>
          <p>
            <strong>Shipment ID:</strong>{" "}
            {order.shipment?.shipment_id || "N/A"}
          </p>
          <p>
            <strong>Tracking ID:</strong>{" "}
            {order.shipment?.tracking_id || "N/A"}
          </p>
          <p>
            <strong>Courier:</strong>{" "}
            {order.shipment?.courier_company || "N/A"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {order.shipment?.tracking_status || "N/A"}
          </p>
        </div>

        {/* Payment */}
        {order.payment && (
          <div className="p-6 rounded-2xl bg-white/60 shadow-neumorph border border-white/40 mb-8">
            <div className="flex items-center gap-2 mb-3 text-luxury-gold">
              <CreditCard />{" "}
              <h2 className="font-semibold text-xl">Payment</h2>
            </div>
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
        <div className="p-6 rounded-2xl bg-white/60 shadow-neumorph border border-white/40 text-center">
          <h2 className="font-semibold text-xl text-luxury-gold mb-4">
            Invoice
          </h2>
          <button
            onClick={downloadInvoice}
            className="btn-premium px-6 py-2 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            Download Invoice
          </button>
        </div>

        <p className="mt-8 text-2xl font-semibold text-center text-luxury-gold">
          Total: ₹{order.total.toFixed(2)}
        </p>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-luxury-gold to-yellow-400 text-white shadow-lg hover:scale-105 transition-transform"
          >
            <ArrowLeft /> Back to Orders
          </button>
        </div>
      </div>
    </section>
  );
};

export default OrderTracking;
