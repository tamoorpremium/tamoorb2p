import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { supabase } from '../../utils/supabaseClient';
import { ArrowLeft, Save, FileText, Download, Send, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';

// --- Interfaces are preserved ---
interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  weight: string;
  product?: {
    name: string;
    image: string | null;
  };
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

// --- Constants are preserved ---
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const ORDER_STATUSES = ['pending', 'confirmed', 'paid', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];
const POLLING_INTERVAL = 30000; // 30 seconds for stability

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  paid: 'bg-green-500/20 text-green-300 border-green-500/30',
  processing: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  packed: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  shipped: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  delivered: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const SHIPMENT_STEPS = ['Packed', 'Picked', 'Shipped', 'Out for Delivery', 'Delivered'];

const AdminOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const prevTrackingStatus = useRef<string | null>(null);

  // --- Using YOUR ORIGINAL, WORKING fetch logic to prevent errors ---
  const fetchOrderDetails = async (isInitialLoad = false) => {
    if (!id) return;
    if (isInitialLoad) setLoading(true);

    try {
      const orderId = parseInt(id, 10);
      if (isNaN(orderId)) {
        toast.error('Invalid order ID');
        navigate('/admin/orders');
        return;
      }
      
      const { data: orderData, error: orderError } = await supabase.from('orders').select('*').eq('id', orderId).single();
      if (orderError) throw orderError;
      
      const { data: itemsData, error: itemsError } = await supabase.from('order_items').select('*, product:products(name, image)').eq('order_id', orderId);
      if (itemsError) throw itemsError;

      const { data: paymentData, error: paymentError } = await supabase.from('payments').select('*').eq('order_id', orderId).single();
      if (paymentError && paymentError.code !== 'PGRST116') throw paymentError;

      const { data: shipmentData, error: shipmentError } = await supabase.from('shipments').select('*').eq('order_id', orderId).single();
      if (shipmentError && shipmentError.code !== 'PGRST116') throw shipmentError;

      const newOrderDetails: OrderDetails = {
        id: orderData.id,
        user_id: orderData.user_id,
        placed_at: orderData.placed_at,
        status: orderData.status,
        total: orderData.total,
        items: (itemsData as OrderItem[]) || [],
        payment: paymentData ? { ...paymentData } : null,
        shipment: shipmentData ? { ...shipmentData, history: shipmentData.history || [] } : null,
        address: orderData.address,
      };

      setOrder(newOrderDetails);
      if(isInitialLoad) setNewStatus(orderData.status);

      if (shipmentData && prevTrackingStatus.current !== shipmentData.tracking_status) {
        if (prevTrackingStatus.current !== null) { // Don't toast on initial load
           toast.info(`Shipment status updated: ${shipmentData.tracking_status}`);
        }
        prevTrackingStatus.current = shipmentData.tracking_status;
      }

    } catch (err: any) {
      toast.error(`Failed to load order details: ${err.message}`);
      console.error(err);
      if(isInitialLoad) navigate('/admin/orders');
    } finally {
      if(isInitialLoad) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails(true);
    const interval = setInterval(() => fetchOrderDetails(false), POLLING_INTERVAL);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const updateStatus = async () => {
    if (!order || newStatus === order.status) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
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
  
  // --- All original Invoice functions are preserved ---
  const generateInvoice = async (orderId: number) => {
    toast.info("Generating invoice...");
    try {
      const res = await fetch(`${API_BASE}/api/invoice?orderId=${orderId}`, { method: 'POST' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to generate invoice");
      }
      const data = await res.json();
      toast.success(`Invoice generated and saved: ${data.file}`);
    } catch (err: any) {
      console.error("Error generating invoice:", err);
      toast.error(`Generate failed: ${err.message}`);
    }
  };

  const downloadInvoice = async (orderId: number) => {
    toast.info("Fetching invoice link...");
    try {
      const res = await fetch(`${API_BASE}/api/get-invoice-link?orderId=${orderId}`);
      if (!res.ok) {
         const text = await res.text();
         throw new Error(text || "Invoice not found or failed to get link.");
      }
      const { url } = await res.json();
      window.open(url, "_blank");
    } catch (err: any) {
       console.error("Download invoice error:", err);
       toast.error(`Download failed: ${err.message}`);
    }
  };
  
  const sendInvoiceEmail = async (orderId: number) => {
    toast.info("Sending invoice email...");
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invoice-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ orderId, testEmail: order?.address?.email }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      toast.success(`Invoice email sent to: ${data.sentTo || order?.address?.email}`);
    } catch (err: any) {
      console.error("Send email error:", err);
      toast.error(`Sending failed: ${err.message}`);
    }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div></div>;
  if (!order) return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex justify-center items-center"><p>Order not found.</p></div>;

  const currentShipmentIndex = SHIPMENT_STEPS.indexOf(order.shipment?.tracking_status || '');
  
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8 font-sans text-gray-100">

        <header className="flex items-center justify-between mb-6 pb-4 border-b border-yellow-400/20">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/orders')} className="p-2 bg-gray-700/50 rounded-full hover:bg-yellow-400/20 transition-colors">
              <ArrowLeft size={20} className="text-yellow-300" />
            </button>
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-yellow-400">Order #{order.id}</h1>
                <p className="text-sm text-gray-400">{dayjs(order.placed_at).format('DD MMM YYYY, hh:mm A')}</p>
            </div>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
              <h2 className="text-xl font-bold text-yellow-300 mb-4">Order Items</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="border-b border-yellow-400/20">
                    <tr className="text-yellow-300 uppercase text-xs">
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-yellow-400/10">
                    {order.items.map(item => (
                      <tr key={item.id}>
                        <td className="p-3 flex items-center gap-3">
                          <img src={item.product?.image || 'https://placehold.co/48x48/1a202c/FBBF24?text=Img'} alt={item.product?.name} className="w-12 h-12 rounded-md object-cover"/>
                          <div>
                            <p className="font-semibold text-gray-200">{item.product?.name || `Product ID: ${item.product_id}`}</p>
                            <p className="text-xs text-gray-400">Weight: {item.weight}</p>
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono">{item.quantity}</td>
                        <td className="p-3 text-right font-mono">₹{item.price.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono font-semibold">₹{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {order.payment && (
                  <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
                    <h2 className="text-xl font-bold text-yellow-300 mb-4">Payment Details</h2>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between"><strong>Method:</strong> <span className="text-gray-300">{order.payment.payment_method}</span></p>
                      <p className="flex justify-between"><strong>Status:</strong> <span className="font-semibold text-green-400">{order.payment.payment_status}</span></p>
                      <p className="flex justify-between"><strong>Transaction ID:</strong> <span className="text-gray-300 font-mono text-xs">{order.payment.transaction_id}</span></p>
                      <p className="flex justify-between"><strong>Paid At:</strong> <span className="text-gray-300">{dayjs(order.payment.paid_at).format('DD MMM YYYY, hh:mm A')}</span></p>
                    </div>
                  </div>
                )}
                 {order.shipment && (
                  <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
                    <h2 className="text-xl font-bold text-yellow-300 mb-4">Shipment Details</h2>
                     <div className="space-y-2 text-sm">
                      <p className="flex justify-between"><strong>Courier:</strong> <span className="text-gray-300">{order.shipment.courier_company || 'N/A'}</span></p>
                      <p className="flex justify-between"><strong>AWB No:</strong> <span className="text-gray-300 font-mono">{order.shipment.awb_no || 'N/A'}</span></p>
                      <p className="flex justify-between"><strong>Shipment ID:</strong> <span className="text-gray-300 font-mono text-xs">{order.shipment.shipment_id || 'N/A'}</span></p>
                      <p className="flex justify-between"><strong>Tracking ID:</strong> <span className="text-gray-300 font-mono text-xs">{order.shipment.tracking_id || 'N/A'}</span></p>
                      <p className="flex justify-between items-center"><strong>Status:</strong> <span className="px-2 py-0.5 rounded-full text-xs font-semibold">{order.shipment.tracking_status}</span></p>
                       <p className="flex justify-between"><strong>Last Update:</strong> <span className="text-gray-300">{dayjs(order.shipment.last_tracking_update).format('DD MMM, hh:mm A')}</span></p>
                    </div>
                  </div>
                )}
            </div>
             {order.shipment && (
                <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
                    <h2 className="text-xl font-bold text-yellow-300 mb-6">Tracking History</h2>
                    <div className="flex justify-between items-start">
                        {SHIPMENT_STEPS.map((step, index) => (
                            <React.Fragment key={step}>
                                <div className="flex flex-col items-center text-center w-20">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${index <= currentShipmentIndex ? 'bg-yellow-400 border-yellow-400' : 'border-gray-600'}`}>
                                        {index <= currentShipmentIndex && <div className="w-3 h-3 bg-gray-900 rounded-full"></div>}
                                    </div>
                                    <p className={`mt-2 text-xs ${index <= currentShipmentIndex ? 'text-yellow-300 font-semibold' : 'text-gray-500'}`}>{step}</p>
                                </div>
                                {index < SHIPMENT_STEPS.length - 1 && <div className={`flex-1 h-1 mt-3 ${index < currentShipmentIndex ? 'bg-yellow-400' : 'bg-gray-600'}`}/>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
              <h2 className="text-xl font-bold text-yellow-300 mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between"><strong>Current Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span></p>
                <p className="flex justify-between font-bold text-lg"><strong>Total:</strong> <span className="font-mono text-yellow-300">₹{order.total.toFixed(2)}</span></p>
              </div>
              <div className="mt-4 pt-4 border-t border-yellow-400/10">
                <label className="block text-sm font-semibold text-yellow-300 mb-2">Update Status</label>
                <div className="flex gap-2">
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full rounded-lg py-2 px-4 bg-gray-900/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400">
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                  <button onClick={updateStatus} disabled={saving || newStatus === order.status} className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-bold disabled:bg-gray-600 disabled:cursor-not-allowed hover:scale-105 transition-transform">
                      <Save size={16} />
                  </button>
                </div>
              </div>
            </div>

            {order.address && (
              <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
                <h2 className="text-xl font-bold text-yellow-300 mb-4">Shipping Address</h2>
                <address className="not-italic text-sm text-gray-300 leading-relaxed">
                  <strong>{order.address.full_name}</strong><br/>
                  {order.address.address}<br/>
                  {order.address.city}, {order.address.state} - {order.address.pincode}<br/>
                  Phone: {order.address.phone}
                </address>
              </div>
            )}

            <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
              <h2 className="text-xl font-bold text-yellow-300 mb-4">Invoice Actions</h2>
              <div className="flex flex-col gap-3">
                <button onClick={() => generateInvoice(order.id)} className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                  <FileText size={16} /> Generate Invoice
                </button>
                <button onClick={() => downloadInvoice(order.id)} className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition">
                  <Download size={16} /> Download Invoice
                </button>
                <button onClick={() => sendInvoiceEmail(order.id)} className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition">
                  <Send size={16} /> Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminOrderDetails;

