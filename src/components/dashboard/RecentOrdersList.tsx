import React from 'react';
import { Truck } from 'lucide-react';

interface Order {
  id: string;
  placed_at: string;
  status: string;
  total: number;
}

interface RecentOrdersListProps {
  orders: Order[];
}

const RecentOrdersList: React.FC<RecentOrdersListProps> = ({ orders }) => {
  return (
    <div className="luxury-card glass rounded-3xl p-8">
      <h2 className="text-3xl font-display font-bold text-neutral-800 mb-8">Recent Orders</h2>
      {orders.length === 0 ? (
        <p className="text-neutral-500">No recent orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="neomorphism rounded-2xl p-6 flex justify-between items-center">
              <div>
                <h3 className="font-display font-semibold text-lg text-neutral-800">Order #{order.id}</h3>
                <p className="text-neutral-600 font-medium">Placed on {new Date(order.placed_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-blue-600 bg-blue-100">
                  <Truck className="w-4 h-4 mr-2" />
                  {order.status}
                </div>
                <div className="text-2xl font-display font-bold tamoor-gradient mt-2">₹{order.total.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentOrdersList;
