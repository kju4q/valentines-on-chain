import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import HeartLoader from "./HeartLoader";
import GiftCard from "./GiftCard";
import { TransactionModal } from "../components/TransactionModal";
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

// Add the nicknames array (you can move this to a shared constants file later)
const VALENTINE_NICKNAMES = [
  "HopelessRomantic",
  "LoveChampion",
  "HeartBreaker",
  "CupidArrow",
  "SweetHeart",
  "LovePoet",
  "RoseKeeper",
  "DreamLover",
  "RomanticSoul",
  "LoveWarrior",
  "HeartMaker",
  "ValentineKing",
  "LoveCrafter",
  "HeartWhisperer",
  "RomanceArtist",
];

const MainPage = () => {
  const { user, logout } = usePrivy();
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

  const handleMintNFT = async (recipient: string) => {
    // TODO: Implement NFT minting
    console.log("Minting NFT for:", recipient);
  };

  // Generate nickname based on user's address
  const getNickname = (address: string) => {
    // Use the last few characters of the address to determine the nickname index
    const index = parseInt(address.slice(-4), 16) % VALENTINE_NICKNAMES.length;
    return `0x${VALENTINE_NICKNAMES[index]}`;
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
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-300 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-pink-600">
                {userProfile?.nickname}
              </h1>
              <span className="text-sm text-pink-400">
                {userProfile?.shortAddress}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors disabled:opacity-50"
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
                  ? "bg-pink-500 text-white"
                  : "bg-white/30 text-pink-600 hover:bg-white/50"
              }`}
            >
              <GiftIcon className="w-5 h-5" />
              Send Gifts
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                activeTab === "leaderboard"
                  ? "bg-pink-500 text-white"
                  : "bg-white/30 text-pink-600 hover:bg-white/50"
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
