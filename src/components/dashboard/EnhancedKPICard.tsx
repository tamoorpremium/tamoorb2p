// src/components/dashboard/EnhancedKPICard.tsx
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface TrendData {
  name: string;
  value: number;
}

interface EnhancedKPICardProps {
  title: string;
  value: string; // Can be a formatted string like "₹1,23,456"
  trend: TrendData[];
  icon: React.ReactNode;
  trendColor: string; // e.g., '#34D399' for positive, '#F472B6' for negative
}

const EnhancedKPICard: React.FC<EnhancedKPICardProps> = ({ title, value, trend, icon, trendColor }) => {
  return (
    // Added glow effect on hover and transition
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl 
                   transition-all duration-300 hover:border-slate-500 hover:shadow-cyan-500/10">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-100 mt-1">{value}</p>
        </div>
        <div className="bg-slate-800 p-3 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="mt-4 h-16 w-full">
        {/* Sparkline Chart */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={trendColor} 
              strokeWidth={2.5} 
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnhancedKPICard;