// src/pages/admin/AdminOrderDetails.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { supabase } from '../../utils/supabaseClient';


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

interface ShipmentHistoryItem {
  status: string;
  updated_at: string;
}

interface ShipmentInfo {
  shipment_id: string | null;
  tracking_id: string | null;
  courier_company: string | null;
  tracking_status: string | null;
  awb_no: string | null;
  last_tracking_update?: string;
  history?: ShipmentHistoryItem[];
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
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'paid',
  'processing',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
];

const projectRef = "bvnjxbbwxsibslembmty"; // <-- your Supabase project ref
const supabaseUrl = `https://${projectRef}.functions.supabase.co`;

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-400 text-gray-900',
  confirmed: 'bg-blue-500 text-white',
  paid: 'bg-green-600 text-white',
  processing: 'bg-indigo-500 text-white',
  packed: 'bg-purple-600 text-white',
  shipped: 'bg-orange-500 text-white',
  delivered: 'bg-green-800 text-white',
  cancelled: 'bg-red-600 text-white',
};

const SHIPMENT_STEPS = [
  'Packed',
  'Picked',
  'Shipped',
  'Out for Delivery',
  'Arriving Early',
  'Delivery Delayed',
  'Delivered',
];

const SHIPMENT_COLORS: Record<string, string> = {
  Packed: 'bg-purple-600',
  Picked: 'bg-blue-500',
  Shipped: 'bg-orange-500',
  'Out for Delivery': 'bg-indigo-600',
  'Arriving Early': 'bg-green-500',
  'Delivery Delayed': 'bg-red-600',
  Delivered: 'bg-green-800',
};

const POLLING_INTERVAL = 10000; // 10 seconds

const AdminOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const prevTrackingStatus = useRef<string | null>(null);

  const generateInvoice = async (orderId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/invoice?orderId=${orderId}`);
      if (!res.ok) throw new Error("Failed to generate invoice");
      const data = await res.json();
      alert(`✅ Invoice generated and saved: ${data.file}`);
    } catch (err) {
      console.error("Error generating invoice:", err);
      alert("❌ Failed to generate invoice");
    }
  };


  const fetchOrderDetails = async () => {
    if (!id) return;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      toast.error('Invalid order ID');
      navigate('/admin/orders');
      return;
    }

    setLoading(true);
    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      if (orderError || !orderData) throw orderError || new Error('Order not found');

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      if (itemsError) throw itemsError;

      // Fetch payment
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .single();
      if (paymentError && paymentError.code !== 'PGRST116') throw paymentError;

      // Fetch shipment
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('order_id', orderId)
        .single();
      if (shipmentError && shipmentError.code !== 'PGRST116') throw shipmentError;

      setOrder({
        id: orderData.id,
        user_id: orderData.user_id,
        placed_at: orderData.placed_at,
        status: orderData.status,
        total: orderData.total,
        items: itemsData || [],
        payment: paymentData
          ? {
              payment_method: paymentData.payment_method,
              payment_status: paymentData.payment_status,
              transaction_id: paymentData.transaction_id,
              amount: paymentData.amount,
              paid_at: paymentData.paid_at,
            }
          : null,
        shipment: shipmentData
          ? {
              shipment_id: shipmentData.shipment_id,
              tracking_id: shipmentData.tracking_id,
              courier_company: shipmentData.courier_company,
              tracking_status: shipmentData.tracking_status,
              awb_no: shipmentData.awb_no,
              last_tracking_update: shipmentData.last_tracking_update,
              history: shipmentData.tracking_status
                ? [
                    {
                      status: shipmentData.tracking_status,
                      updated_at: shipmentData.last_tracking_update || new Date().toISOString(),
                    },
                  ]
                : [],
            }
          : null,
        address: orderData.address || null,
      });

      setNewStatus(orderData.status);
      prevTrackingStatus.current = shipmentData?.tracking_status || null;
    } catch (err) {
      toast.error('Failed to load order details');
      console.error(err);
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    // eslint-disable-next-line
  }, [id]);

  // Polling for shipment updates
  useEffect(() => {
    if (!order) return;
    const interval = setInterval(async () => {
      try {
        const { data: shipmentData, error: shipmentError } = await supabase
          .from('shipments')
          .select('*')
          .eq('order_id', order.id)
          .single();
        if (shipmentError && shipmentError.code !== 'PGRST116') throw shipmentError;

        if (shipmentData) {
          if (prevTrackingStatus.current !== shipmentData.tracking_status) {
            // Add to history
            setOrder(prev =>
              prev
                ? {
                    ...prev,
                    shipment: {
                      ...prev.shipment!,
                      tracking_status: shipmentData.tracking_status,
                      last_tracking_update: shipmentData.last_tracking_update,
                      history: [
                        ...(prev.shipment?.history || []),
                        {
                          status: shipmentData.tracking_status!,
                          updated_at:
                            shipmentData.last_tracking_update || new Date().toISOString(),
                        },
                      ],
                    },
                  }
                : prev
            );

            // Toast notifications
            if (shipmentData.tracking_status === 'Delivery Delayed')
              toast.error('Shipment delivery delayed!');
            else if (shipmentData.tracking_status === 'Arriving Early')
              toast.success('Shipment arriving early!');
            else toast.info(`Shipment status updated: ${shipmentData.tracking_status}`);

            prevTrackingStatus.current = shipmentData.tracking_status;
          }
        }
      } catch (err) {
        console.error('Polling shipment failed', err);
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [order?.id]);

  const updateStatus = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);
      if (error) throw error;
      setOrder({ ...order, status: newStatus });
      toast.success('Order status updated.');
    } catch (error) {
      toast.error('Failed to update status.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center text-tamoor-charcoal">Loading...</p>;
  if (!order) return <p className="text-center text-tamoor-charcoal">Order not found.</p>;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="luxury-card glass p-4 sm:p-8 rounded-3xl shadow-xl max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-tamoor-charcoal">Order Details</h1>

        {/* Basic Info */}
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Order Date:</strong> {new Date(order.placed_at).toLocaleString()}</p>

        {/* Status */}
        <div className="my-4">
          <label className="block font-semibold mb-1 text-tamoor-charcoal">Change Order Status:</label>
          <select
            className="w-full rounded border border-gray-300 p-2"
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
            disabled={saving}
          >
            {ORDER_STATUSES.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <button onClick={updateStatus} disabled={saving} className="btn-premium mt-2 w-full sm:w-auto">
            {saving ? 'Saving...' : 'Update Status'}
          </button>
        </div>

        {/* Customer Info */}
        <div className="my-4 bg-tamoor-white/40 rounded-xl shadow p-4 sm:p-6 border border-slate-200">
          <h2 className="text-lg sm:text-xl font-semibold text-tamoor-charcoal mb-2">Customer Details</h2>
          <p><strong>Name:</strong> {order.address?.full_name || 'N/A'}</p>
          <p><strong>Phone:</strong> {order.address?.phone || 'N/A'}</p>
          <p><strong>Address:</strong></p>
          {order.address ? (
            <address className="whitespace-pre-line ml-0 sm:ml-4 text-tamoor-charcoal">
              {[order.address.address, order.address.city, order.address.state, order.address.pincode].filter(Boolean).join('\n')}
            </address>
          ) : (
            <p>N/A</p>
          )}
        </div>

        {/* Order Items */}
        <h2 className="mt-6 text-2xl font-semibold text-tamoor-charcoal">Items</h2>
        <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-slate-300">
          <thead>
            <tr className="bg-tamoor-gold-light text-white">
              <th className="p-3 text-left">Product ID</th>
              <th className="p-3 text-right">Quantity</th>
              <th className="p-3 text-right">Price (₹)</th>
              <th className="p-3 text-right">Weight</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.id} className="border border-slate-300">
                <td className="p-3">{item.product_id}</td>
                <td className="p-3 text-right">{item.quantity}</td>
                <td className="p-3 text-right">{item.price.toFixed(2)}</td>
                <td className="p-3 text-right">{item.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {/* Payment Info */}
        {order.payment && (
          <div className="mt-6 bg-tamoor-white/40 rounded-xl shadow p-4 sm:p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-tamoor-charcoal mb-2">Payment Details</h2>
            <p><strong>Payment Method:</strong> {order.payment.payment_method}</p>
            <p><strong>Payment Status:</strong> {order.payment.payment_status}</p>
            <p><strong>Transaction ID:</strong> {order.payment.transaction_id}</p>
            <p><strong>Amount:</strong> ₹{order.payment.amount.toFixed(2)}</p>
            {order.payment.paid_at && <p><strong>Paid At:</strong> {new Date(order.payment.paid_at).toLocaleString()}</p>}
          </div>
        )}

        {/* Shipment Info */}
        {order.shipment && (
          <div className="mt-6 bg-tamoor-white/40 rounded-xl shadow p-4 sm:p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-tamoor-charcoal mb-2">Shipment Details</h2>
            <p><strong>Shipment ID:</strong> {order.shipment.shipment_id || 'N/A'}</p>
            <p><strong>Tracking ID:</strong> {order.shipment.tracking_id || 'N/A'}</p>
            <p><strong>Courier Company:</strong> {order.shipment.courier_company || 'N/A'}</p>
            <p><strong>AWB No:</strong> {order.shipment.awb_no || 'N/A'}</p>
            <p><strong>Tracking Status:</strong> {order.shipment.tracking_status || 'N/A'}</p>
            {order.shipment.last_tracking_update && <p><strong>Last Tracking Update:</strong> {new Date(order.shipment.last_tracking_update).toLocaleString()}</p>}

            {/* Stepper */}
            <div className="mt-4">
              {SHIPMENT_STEPS.map(step => {
                const stepIndex = SHIPMENT_STEPS.indexOf(step);
                const currentIndex = SHIPMENT_STEPS.indexOf(order.shipment!.tracking_status || 'Packed');
                const stepCompleted = stepIndex <= currentIndex;
                return (
                  <div key={step} className="mt-4 flex flex-col sm:flex-col gap-2 items-center mb-2">
                    <div className={`w-4 h-4 rounded-full mr-3 ${stepCompleted ? SHIPMENT_COLORS[step] : 'bg-gray-300'}`} />
                    <span className={`${stepCompleted ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{step}</span>
                  </div>
                );
              })}
            </div>

            {/* Shipment History */}
            {order.shipment.history && order.shipment.history.length > 0 && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-2 text-tamoor-charcoal">Shipment History</h3>
                <ul>
                  {order.shipment.history.slice().reverse().map((h, idx) => (
                    <li key={idx} className="mb-1">
                      <span className="font-medium">{h.status}</span> — <span className="text-gray-500 text-sm">{new Date(h.updated_at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

{/* Invoice Actions */}
<div className="mt-6 bg-tamoor-white/40 rounded-xl shadow p-4 sm:p-6 border border-slate-200">
  <h2 className="text-xl font-semibold text-tamoor-charcoal mb-2">Invoice</h2>
  <div className="flex flex-col sm:flex-row gap-4">

    {/* Generate Invoice */}
    <button
      onClick={async () => {
        console.log(`[Invoice] Generating invoice for order ${order.id}...`);
        try {
          const res = await fetch(`${API_BASE}/api/invoice?orderId=${order.id}`, {
            method: 'POST', // make POST if your server expects it
            headers: {
              'Content-Type': 'application/json',
            },
          });

          console.log('[Invoice] Raw response:', res);

          if (!res.ok) {
            const text = await res.text();
            console.error('[Invoice] Server responded with error:', text);
            throw new Error(text || "Failed to generate invoice");
          }

          const data = await res.json();
          console.log('[Invoice] Success response data:', data);

          toast.success(`✅ Invoice generated & saved: ${data.file}`);
        } catch (err: any) {
          console.error('[Invoice] Generate invoice error:', err);

          if (err.message === 'Failed to fetch') {
            toast.error('⚠️ Could not reach invoice server (CORS or network issue)');
            console.log('[Invoice] Likely CORS issue. Make sure your API server allows localhost or your dev domain.');
          } else if (err.message.includes('401')) {
            toast.error('❌ Unauthorized. Check your API keys or authentication.');
          } else {
            toast.error(`❌ Generate failed: ${err.message}`);
          }
        }
      }}
      className="btn-premium"
    >
      Generate Invoice
    </button>

    {/* Download Invoice */}
    <button
      onClick={async () => {
        console.log(`[Invoice] Fetching signed invoice URL for order ${order.id}...`);
        try {
          const res = await fetch(`${API_BASE}/api/get-invoice-link?orderId=${order.id}`, {
            method: 'GET',
          });

          console.log('[Invoice] Raw response:', res);

          if (!res.ok) {
            const text = await res.text();
            console.error('[Invoice] Server responded with error:', text);
            throw new Error(text || "Invoice not found");
          }

          const { url } = await res.json();
          console.log('[Invoice] Signed URL received:', url);

          window.open(url, "_blank"); // open invoice in new tab
        } catch (err: any) {
          console.error('[Invoice] Download invoice error:', err);

          if (err.message === 'Failed to fetch') {
            toast.error('⚠️ Could not reach invoice server (CORS or network issue)');
            console.log('[Invoice] Likely CORS issue. Make sure your API server allows localhost or your dev domain.');
          } else {
            toast.error(`❌ Download failed: ${err.message}`);
          }
        }
      }}
      className="btn-premium"
    >
      Download Invoice
    </button>

    {/* Send Invoice Email */}
<button
  onClick={async () => {
    console.log(`[Invoice] Sending invoice email for order ${order.id}...`);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invoice-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            orderId: order.id,
            //testEmail: 'tamoorpremium@gmail.com', // test email
            testEmail: order.address?.email, // use customer email in prod
          }),
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      toast.success(
        `📧 Invoice email sent to: ${data.sentTo || order.address?.email}`
      );
    } catch (err: any) {
      console.error('[Invoice] Send email error:', err);
      toast.error(`❌ Sending email failed: ${err.message} , check if you have generated the invoice before sending`);
    }
  }}
  className="btn-premium"
>
  Send Invoice Email
</button>


  </div>
</div>




        <p className="mt-6 font-semibold text-tamoor-charcoal"><strong>Total Amount:</strong> ₹{order.total.toFixed(2)}</p>
        <button onClick={() => navigate('/admin/orders')} className="btn-premium mt-6">Back to Orders</button>
      </div>
    </>
  );
};

export default AdminOrderDetails;
