import { useState } from "react";
import { LoadingButton } from "./LoadingButton";

interface GiftNFTProps {
  onMint: (recipient: string) => Promise<void>;
}

export const GiftNFT = ({ onMint }: GiftNFTProps) => {
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!recipient) return;
    setLoading(true);
    setError(null);

    try {
      await onMint(recipient);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mint NFT");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white/30 backdrop-blur-sm rounded-2xl">
      <h3 className="text-xl font-bold text-pink-600 mb-4">
        Gift Valentine NFT
      </h3>
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
            disabled={loading}
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <LoadingButton onClick={handleMint} loading={loading}>
          Mint Valentine NFT
        </LoadingButton>
      </div>
    </div>
  );
};
