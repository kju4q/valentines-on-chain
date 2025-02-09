import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import HeartLoader from "./HeartLoader";
import GiftCard from "./GiftCard";
import TransactionModal from "./TransactionModal";
import {
  CurrencyDollarIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

interface Transaction {
  type: "crypto" | "shefi";
  amount?: string;
  recipient: string;
}

const MainPage = () => {
  const { user, logout } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } finally {
      // In case logout fails, we'll still remove the loader after a delay
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleTransaction = (
    type: "crypto" | "shefi",
    recipient: string,
    amount?: string
  ) => {
    setTransaction({ type, recipient, amount });
    setShowModal(true);
  };

  return (
    <>
      {isLoading && <HeartLoader />}
      {showModal && transaction && (
        <TransactionModal
          transaction={transaction}
          onClose={() => setShowModal(false)}
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-2xl font-bold text-pink-600">
              Welcome, {user?.wallet?.address?.slice(0, 6)}...
              {user?.wallet?.address?.slice(-4)}
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Disconnect
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <GiftCard
              title="Send Crypto Love"
              description="Send ETH or USDC to your Valentine"
              icon={<CurrencyDollarIcon className="w-8 h-8 text-pink-500" />}
              buttonText="Send Crypto"
              onClick={() => handleTransaction("crypto", "")}
            />
            <GiftCard
              title="Gift SheFi Course"
              description="Gift the SheFi course to empower your Valentine"
              icon={<AcademicCapIcon className="w-8 h-8 text-purple-500" />}
              buttonText="Gift Course ($700)"
              amount="700"
              isComingSoon
              onClick={() => handleTransaction("shefi", "", "700")}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
