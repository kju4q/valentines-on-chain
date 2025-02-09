interface GiftCardProps {
  title: string;
  description: string;
  isComingSoon?: boolean;
  icon: React.ReactNode;
  onClick?: () => void;
  buttonText?: string;
  amount?: string;
}

const GiftCard = ({
  title,
  description,
  isComingSoon,
  icon,
  onClick,
  buttonText,
}: GiftCardProps) => {
  return (
    <div
      className={`relative bg-white/30 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-white/20 ${
        isComingSoon ? "opacity-80" : ""
      }`}
    >
      {isComingSoon && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl backdrop-blur-sm">
          <div className="bg-pink-100 text-pink-600 px-4 py-2 rounded-full font-bold animate-pulse">
            Coming Soon 🌸
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {icon}
        <h3 className="text-xl font-bold text-pink-600">{title}</h3>
        <p className="text-pink-700/80">{description}</p>
        {!isComingSoon && buttonText && (
          <button
            onClick={onClick}
            className="w-full px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold transition-all duration-300 hover:shadow-lg"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default GiftCard;
