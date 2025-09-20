import React from 'react';

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass?: string; // fallback color
  status?: 'confirmed' | 'paid' | 'cancelled' | 'pending';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, colorClass, status }) => {
  // Determine color based on status
  const statusColorClass = status
    ? status === 'confirmed'
      ? 'bg-blue-600'
      : status === 'paid'
      ? 'bg-green-600'
      : status === 'cancelled'
      ? 'bg-red-600'
      : status === 'pending'
      ? 'bg-yellow-400'
      : colorClass
    : colorClass;

  return (
    <div
      className={`relative luxury-card glass animate-gradient-border p-8 flex items-center space-x-6 shadow-xl transition-transform duration-500 hover:scale-[1.03] hover:shadow-2xl cursor-pointer`}
      tabIndex={0}
      aria-label={`${title}: ${value.toLocaleString()}`}
    >
      {/* Icon with colored background */}
      <div
        className={`${statusColorClass} w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl shadow-lg z-10`}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Title and value */}
      <div className="relative z-10">
        <h3 className="font-display text-lg font-semibold text-tamoor-charcoal mb-2 tracking-wider">{title}</h3>
        <p className="text-4xl font-display font-extrabold tamoor-gradient tracking-wider">{value.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default KPICard;
