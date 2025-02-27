import React, { useState } from "react";
import { useCelebrationGifts } from "../hooks/useCelebratingGifts";
import { AIGiftCreator } from "./AIGiftCreator";
import type { GiftSuggestion } from "../services/ai/GiftAdvisor";
import { GiftAdvisor } from "../services/ai/GiftAdvisor";
import { LoadingButton } from "./LoadingButton";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
<<<<<<< HEAD
import { useValentineNFTs } from "../hooks/useValentineNFTs";
=======
>>>>>>> 3b6043a (fixes on the theme and updating the nft for first gift)
import { usePrivy } from "@privy-io/react-auth";
import { useCelebrationNFTs } from "../hooks/useCelebrationNFTs";

interface TransactionModalProps {
  transaction?: {
    type: "crypto" | "shefi";
    recipient: string;
    amount?: string;
  };
  show?: boolean;
  onClose: () => void;
  defaultValues?: {
    amount: string;
    token: string;
    recipient: string;
    message: string;
  };
}

const TransactionModal = ({
  transaction,
  show = true,
  onClose,
  defaultValues,
}: TransactionModalProps) => {
  // Initialize with either transaction props or defaultValues
  const [recipient, setRecipient] = useState(
    transaction?.recipient || defaultValues?.recipient || ""
  );
  const [amount, setAmount] = useState(
    transaction?.amount || defaultValues?.amount || "0.01"
  );
  const [message, setMessage] = useState(defaultValues?.message || "");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"form" | "ai">("form");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { sendEthGift, sendUsdcGift, sendSheFiGift, ready } =
    useCelebrationGifts();
  const { mintFirstGiftNFT } = useCelebrationNFTs();
  const { user } = usePrivy();

  // Determine transaction type from either source
  const txType =
    transaction?.type ||
    (defaultValues?.token === "shefi" ? "shefi" : "crypto");

  // Don't render if not showing
  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) {
      setError("Please enter a recipient address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let hash;

      if (txType === "crypto") {
        // For now, just support ETH
        hash = await sendEthGift(recipient, amount, message);
      } else if (txType === "shefi") {
        hash = await sendSheFiGift(recipient);
      }

      if (hash) {
        setTxHash(hash);
        setSuccess(true);

        // If this is the user's first gift, mint them an NFT
        if (user?.wallet?.address) {
          try {
            await mintFirstGiftNFT(user.wallet.address);
          } catch (err) {
            console.error("Failed to mint NFT:", err);
            // Don't show error to user, as the main transaction succeeded
          }
        }
      }
    } catch (err) {
      console.error("Transaction failed:", err);
      setError("Transaction failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAISuggestion = () => {
    setStep("ai");
  };

  const handleGiftSelect = (suggestion: GiftSuggestion) => {
    setAmount(suggestion.amount);
    setMessage(suggestion.message);
    setStep("form");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {step === "ai" ? (
          <div className="p-6">
            <button
              onClick={() => setStep("form")}
              className="flex items-center text-amber-600 hover:text-amber-700 mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back
            </button>
            <h2 className="text-2xl font-bold text-amber-700 mb-4">
              Gift Suggestions
            </h2>
            <AIGiftCreator
              onGiftSelect={handleGiftSelect}
              onSuggestion={handleAISuggestion}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber-700">
                {txType === "crypto" ? "Send Crypto Gift" : "Gift a Course"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-amber-500 hover:text-amber-700"
              >
                ✕
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-amber-700 mb-2">
                  Gift Sent Successfully!
                </h3>
                <p className="text-amber-600 mb-4">
                  Your gift has been sent successfully.
                </p>
                {txHash && (
                  <a
                    href={`https://sepolia.basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500 hover:text-amber-600 underline"
                  >
                    View transaction
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 w-full px-4 py-2 bg-yellow-50 text-amber-700 border border-amber-200 rounded-full hover:bg-yellow-100 hover:border-amber-300 transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <label
                    htmlFor="recipient"
                    className="block text-sm font-medium text-amber-700 mb-1"
                  >
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    id="recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 outline-none"
                    required
                  />
                </div>

                {txType === "crypto" && (
                  <>
                    <div className="mb-4">
                      <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-amber-700 mb-1"
                      >
                        Amount (ETH)
                      </label>
                      <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0.001"
                        step="0.001"
                        className="w-full px-4 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 outline-none"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-1">
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-amber-700"
                        >
                          Message (optional)
                        </label>
                        <button
                          type="button"
                          onClick={handleAISuggestion}
                          className="text-xs text-amber-500 hover:text-amber-600"
                        >
                          Get AI Suggestions
                        </button>
                      </div>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a personal message..."
                        className="w-full px-4 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 outline-none min-h-[100px]"
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg border border-red-100">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-amber-200 text-amber-700 rounded-full hover:bg-amber-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    loading={isLoading}
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-yellow-50 text-amber-700 border border-amber-200 rounded-full hover:bg-yellow-100 hover:border-amber-300 transition-all disabled:opacity-50"
                  >
                    {txType === "crypto" ? "Send Gift" : "Gift Course"}
                  </LoadingButton>
                </div>
              </div>
            )}
          </form>
        )}
        {/* Add indicator if coming from Twitter */}
        {defaultValues && (
          <div className="text-sm text-gray-500 mt-2">
            💝 Gift initiated from Twitter
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionModal;
