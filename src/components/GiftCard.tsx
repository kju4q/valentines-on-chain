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
  buttonText = "Select",
  amount,
}: GiftCardProps) => {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-amber-100">
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className="mr-4 p-3 bg-amber-50 rounded-full border border-amber-100">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-800">{title}</h3>
            {amount && (
              <span className="text-sm text-amber-600">${amount}</span>
            )}
          </div>
        </div>
        <p className="text-amber-700/80 mb-6 flex-grow">{description}</p>
        {isComingSoon ? (
          <div className="text-center py-2 px-4 bg-amber-50 text-amber-500 rounded-full border border-amber-100">
            Coming Soon
          </div>
        ) : (
          buttonText && (
            <button
              onClick={onClick}
              className="w-full px-6 py-3 bg-yellow-50 text-amber-700 border border-amber-200 rounded-full font-semibold transition-all hover:bg-yellow-100 hover:border-amber-300 hover:shadow-md"
            >
              {buttonText}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default GiftCard;
