import React, { useState } from "react";
import { useValentineGifts } from "../hooks/useValentineGifts";
import { AIGiftCreator } from "./AIGiftCreator";
import type { GiftSuggestion } from "../services/ai/GiftAdvisor";
import { GiftAdvisor } from "../services/ai/GiftAdvisor";

interface TransactionModalProps {
  transaction: {
    type: "crypto" | "shefi";
    amount?: string;
    recipient: string;
  };
  onClose: () => void;
}

const TransactionModal = ({ transaction, onClose }: TransactionModalProps) => {
  const [showAI, setShowAI] = useState(false);
  const [recipient, setRecipient] = useState(transaction.recipient);
  const [amount, setAmount] = useState(transaction.amount || "");
  const { sendEthGift, sendUsdcGift, sendSheFiGift, isLoading, ready } =
    useValentineGifts();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const handleGiftSelect = (suggestion: GiftSuggestion) => {
    if (suggestion.type === "eth" || suggestion.type === "usdc") {
      setAmount(suggestion.amount);
    }
    setShowAI(false);
  };

  const getAISuggestion = async () => {
    try {
      const advisor = new GiftAdvisor(import.meta.env.VITE_OPENAI_API_KEY);

      const suggestion = await advisor.suggestGift(
        "Suggest a romantic Valentine's gift with a sweet message"
      );

      setAmount(suggestion.amount);
      setMessage(suggestion.message);
      // Show success feedback with suggestion.emoji
    } catch (error) {
      setError("Cupid is taking a break, try again!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    if (!ready) {
      setError("Please wait for wallet connection");
      setIsProcessing(false);
      return;
    }

    try {
      if (transaction.type === "crypto") {
        await sendEthGift(recipient, amount);
      } else {
        await sendSheFiGift(recipient);
      }
      setIsSuccess(true);
      setTimeout(onClose, 3000);
    } catch (error) {
      console.error("Transaction failed:", error);
      setError(error instanceof Error ? error.message : "Transaction failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const isButtonDisabled = isLoading || isProcessing;
  const buttonText = isProcessing
    ? "Processing..."
    : isLoading
    ? "Loading..."
    : "Send Gift";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        {isSuccess ? (
          <div className="text-center">
            <div className="text-4xl mb-4">💖</div>
            <h2 className="text-2xl font-bold text-pink-600 mb-2">
              Transaction Sent!
            </h2>
            <p className="text-pink-700/80">
              Your gift is on its way to your cutie!
            </p>
          </div>
        ) : showAI ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-pink-600">
                AI Gift Suggestions
              </h2>
              <button
                onClick={() => setShowAI(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
            </div>
            <AIGiftCreator
              onGiftSelect={handleGiftSelect}
              onSuggestion={getAISuggestion}
            />
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-pink-600">
                {transaction.type === "crypto"
                  ? "Send Crypto Love"
                  : "Gift SheFi Course"}
              </h2>
              {transaction.type === "crypto" && (
                <button
                  type="button"
                  onClick={() => setShowAI(true)}
                  className="text-sm text-pink-500 hover:text-pink-600"
                >
                  Ask Cupid for Ideas ��
                </button>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pink-600 mb-1">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="0x..."
                  required
                  disabled={isButtonDisabled}
                />
              </div>
              {transaction.type === "crypto" && (
                <div>
                  <label className="block text-sm font-medium text-pink-600 mb-1">
                    Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="0.0"
                    required
                    disabled={isButtonDisabled}
                  />
                </div>
              )}
              {error && (
                <div className="text-red-500 text-sm mt-2 text-center">
                  {error}
                </div>
              )}
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isButtonDisabled}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isButtonDisabled}
                >
                  {buttonText}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TransactionModal;
