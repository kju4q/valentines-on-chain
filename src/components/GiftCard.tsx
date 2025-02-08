import React from "react";

interface GiftCardProps {
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  amount?: string;
  onClick: () => void;
}

const GiftCard = ({
  title,
  description,
  icon,
  buttonText,
  onClick,
}: GiftCardProps) => {
  return (
    <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-white/20">
      <div className="text-4xl mb-4">{icon}</div>
      <h2 className="text-xl font-semibold text-pink-600 mb-2">{title}</h2>
      <p className="text-pink-700/80 mb-6">{description}</p>
      <button
        onClick={onClick}
        className="w-full px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold transition-all duration-300 hover:shadow-lg"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default GiftCard;
