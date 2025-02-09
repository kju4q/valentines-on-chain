import {
  CurrencyDollarIcon,
  AcademicCapIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import GiftCard from "./GiftCard";

export const GiftGallery = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <GiftCard
        title="Send ETH/USDC"
        description="Send crypto gifts with love 💝"
        icon={<CurrencyDollarIcon className="w-8 h-8 text-pink-500" />}
        buttonText="Send Gift"
        onClick={() => {
          /* handle click */
        }}
      />

      <GiftCard
        title="SheFi Course"
        description="Gift the power of knowledge"
        isComingSoon
        icon={<AcademicCapIcon className="w-8 h-8 text-purple-500" />}
      />

      <GiftCard
        title="Digital Flowers"
        description="Send eternal blooms on-chain"
        isComingSoon
        icon={<SparklesIcon className="w-8 h-8 text-rose-500" />}
      />
    </div>
  );
};
