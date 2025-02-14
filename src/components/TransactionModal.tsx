import React, { useState, useEffect } from "react";
import { useValentineGifts } from "../hooks/useValentineGifts";
import { AIGiftCreator } from "./AIGiftCreator";
import type { GiftSuggestion } from "../services/ai/GiftAdvisor";
import { GiftAdvisor } from "../services/ai/GiftAdvisor";
import { LoadingButton } from "./LoadingButton";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useValentineNFTs } from "../hooks/useValentineNFTs";
import { usePrivy } from "@privy-io/react-auth";

interface TransactionModalProps {
  show: boolean;
  onClose: () => void;
  defaultValues?: {
    amount: string;
    token: string;
    recipient: string;
    message: string;
  };
}

export function TransactionModal({
  show,
  onClose,
  defaultValues,
}: TransactionModalProps) {
  const { user } = usePrivy();
  const [showAI, setShowAI] = useState(false);
  const [recipient, setRecipient] = useState(defaultValues?.recipient || "");
  const [amount, setAmount] = useState(defaultValues?.amount || "");
  const { sendEthGift, sendUsdcGift, sendSheFiGift, isLoading, ready } =
    useValentineGifts();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(defaultValues?.message || "");
  const [suggestion, setSuggestion] = useState<GiftSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const { mintFirstGiftNFT, mintMilestoneNFT } = useValentineNFTs();
  const [nftMinted, setNftMinted] = useState(false);
  const [nftResult, setNftResult] = useState<{
    txHash: string;
    tokenId: string;
  } | null>(null);

  useEffect(() => {
    // Pre-fill values if coming from deep link
    if (defaultValues) {
      setAmount(defaultValues.amount);
      setRecipient(defaultValues.recipient);
      setMessage(defaultValues.message);

      // Log the values to verify they're being set
      console.log("Setting default values:", defaultValues);
    }
  }, [defaultValues]);

  const handleGiftSelect = (suggestion: GiftSuggestion) => {
    if (suggestion.type === "eth" || suggestion.type === "usdc") {
      setAmount(suggestion.amount);
    }
    setSuggestion(suggestion);
    setShowAI(false);
  };

  const getAISuggestion = async () => {
    try {
      const advisor = new GiftAdvisor(process.env.VITE_OPENAI_API_KEY);

      setLoading(true);
      const suggestion = await advisor.suggestGift(
        "Suggest a romantic Valentine's gift with a sweet message"
      );

      setAmount(suggestion.amount);
      setMessage(suggestion.message);
      setSuggestion(suggestion);
      // Show success feedback with suggestion.emoji
    } catch (error) {
      setError("Cupid is taking a break, try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleAIStateChange = (loading: boolean, suggestion: string) => {
    setAiLoading(loading);
    setAiSuggestion(suggestion);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    setNftMinted(false);
    setNftResult(null);

    if (!ready || !user?.wallet?.address) {
      setError("Please connect your wallet");
      setIsProcessing(false);
      return;
    }

    try {
      if (defaultValues?.token === "eth" || defaultValues?.token === "usdc") {
        await sendEthGift(recipient, amount);

        try {
          const result = await mintFirstGiftNFT(user?.wallet?.address || "");
          setNftMinted(true);
          setNftResult(result);
        } catch (nftError) {
          console.error("NFT minting failed:", nftError);
        }
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
            {nftMinted && (
              <div className="mt-4 p-4 bg-pink-50 rounded-xl">
                <p className="text-pink-600">
                  🎉 Congratulations! You received a Valentine NFT!
                </p>
                {nftResult && (
                  <div className="mt-2 space-y-2">
                    <a
                      href={`https://sepolia.basescan.org/tx/${nftResult.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-pink-500 hover:text-pink-600 underline block"
                    >
                      View Transaction
                    </a>
                    <a
                      href={`https://testnets.opensea.io/assets/base-sepolia/${
                        import.meta.env.VITE_NFT_CONTRACT_ADDRESS
                      }/${nftResult.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-pink-500 hover:text-pink-600 underline block"
                    >
                      View on OpenSea
                    </a>
                    <p className="text-xs text-gray-500 mt-1">
                      Note: It may take a few minutes for the NFT to appear on
                      OpenSea
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : showAI ? (
          <>
            <div className="flex justify-between items-center mb-6">
              {!aiLoading && !aiSuggestion && (
                <h2 className="text-2xl font-bold text-pink-600">
                  AI Gift Suggestions
                </h2>
              )}
              <button
                onClick={() => setShowAI(false)}
                className={`text-pink-500 hover:text-pink-600 transition-colors ${
                  !aiLoading && !aiSuggestion ? "" : "ml-auto"
                }`}
                aria-label="Back"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
            </div>
            <AIGiftCreator
              onGiftSelect={handleGiftSelect}
              onSuggestion={getAISuggestion}
              onStateChange={handleAIStateChange}
            />
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-pink-600">
                {defaultValues?.token === "eth" ||
                defaultValues?.token === "usdc"
                  ? "Send Crypto Love"
                  : "Gift SheFi Course"}
              </h2>
              {defaultValues?.token === "eth" ||
                (defaultValues?.token === "usdc" && (
                  <button
                    type="button"
                    onClick={() => setShowAI(true)}
                    className="text-sm text-pink-500 hover:text-pink-600"
                  >
                    Ask Cupid for Ideas
                  </button>
                ))}
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
              {defaultValues?.token === "eth" ||
                (defaultValues?.token === "usdc" && (
                  <div>
                    <label className="block text-sm font-medium text-pink-600 mb-1">
                      Amount ({defaultValues.token})
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
                ))}
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
                <LoadingButton onClick={handleSubmit} loading={isLoading}>
                  {buttonText}
                </LoadingButton>
              </div>
            </div>
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
}
