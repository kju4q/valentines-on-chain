import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import HeartLoader from "./HeartLoader";
import GiftCard from "./GiftCard";
import TransactionModal from "../components/TransactionModal";
import {
  CurrencyDollarIcon,
  AcademicCapIcon,
  TrophyIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";
import { Leaderboard } from "./Leaderboard";
import { useUserProfile } from "../contexts/UserProfileContext";

interface Transaction {
  type: "crypto" | "shefi";
  amount?: string;
  recipient: string;
}

type Tab = "gifts" | "leaderboard";

const MainPage = () => {
  const { logout, user } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("gifts");
  const { userProfile } = useUserProfile();

  useEffect(() => {
    if (user?.twitter?.username) {
      // Send Twitter handle and Privy ID to backend
      fetch("/api/link-twitter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twitterHandle: user.twitter.username,
          privyId: user.id,
        }),
      });
    }
  }, [user]);

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
          show={showModal}
          onClose={() => setShowModal(false)}
          defaultValues={{
            amount: transaction.amount || "",
            token: transaction.type === "crypto" ? "eth" : "shefi",
            recipient: transaction.recipient,
            message: "", // Add empty message by default
          }}
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-amber-700">
                {userProfile?.nickname}
              </h1>
              <span className="text-sm text-amber-500">
                {userProfile?.shortAddress}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-yellow-50 text-amber-700 border border-amber-200 rounded-full hover:bg-yellow-100 hover:border-amber-300 transition-all disabled:opacity-50"
              disabled={isLoading}
            >
              Disconnect
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab("gifts")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                activeTab === "gifts"
                  ? "bg-yellow-50 text-amber-700 border border-amber-200"
                  : "bg-white/30 text-amber-700 border border-amber-100 hover:bg-white/50 hover:border-amber-200"
              }`}
            >
              <GiftIcon className="w-5 h-5" />
              Send Gifts
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                activeTab === "leaderboard"
                  ? "bg-yellow-50 text-amber-700 border border-amber-200"
                  : "bg-white/30 text-amber-700 border border-amber-100 hover:bg-white/50 hover:border-amber-200"
              }`}
            >
              <TrophyIcon className="w-5 h-5" />
              Leaderboard
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "gifts" ? (
            <div className="grid md:grid-cols-2 gap-8">
              <GiftCard
                title="Send Crypto Gift"
                description="Send ETH or USDC to celebrate special moments"
                icon={<CurrencyDollarIcon className="w-8 h-8 text-amber-500" />}
                buttonText="Send Gift"
                onClick={() => handleTransaction("crypto", "")}
              />
              <GiftCard
                title="Gift Learning Course"
                description="Gift a course to empower and educate"
                icon={<AcademicCapIcon className="w-8 h-8 text-orange-500" />}
                buttonText="Gift Course ($700)"
                amount="700"
                isComingSoon
                onClick={() => {
                  // Don't open modal if coming soon
                  if (isComingSoon) return;
                  handleTransaction("shefi", "", "700");
                }}
              />
            </div>
          ) : (
            <Leaderboard />
          )}
        </div>
      </div>
    </>
  );
};

export default MainPage;
