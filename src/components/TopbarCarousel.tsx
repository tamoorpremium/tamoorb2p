import React from "react";
import './topbar.css';

const messages = [
  "✨ Free shipping on orders above ₹999",
  "💎 Premium Quality Dry Fruits",
  "⚡ Limited Time Offer: 20% OFF",
  "🎁 Exclusive Tamoor Loyalty Rewards",
];

const TopbarCarousel = () => {
  return (
    <div className="relative overflow-hidden h-12 md:h-16 w-full">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0 topbar-bg rounded-lg"></div>

      {/* Scrolling text */}
      <div className="animate-scroll flex gap-16 z-10 relative">
        {messages.concat(messages).map((msg, idx) => (
          <span
            key={idx}
            className="futuristic-text whitespace-nowrap text-sm md:text-base font-bold"
          >
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TopbarCarousel;
