import { useState, useEffect } from "react";
import { TrophyIcon } from "@heroicons/react/24/outline";
import { useContract } from "@thirdweb-dev/react";
import { generateNFTImage } from "../services/nft/NFTDesigns";
import { ethers } from "ethers";
import { usePrivy } from "@privy-io/react-auth";
import { useUserProfile } from "../contexts/UserProfileContext";
// import { generateNickname } from "../utils/nicknames";

interface LeaderboardEntry {
  address: string;
  nickname: string;
  points: number;
  rank: string;
  nfts: {
    tokenId: string;
    image: string;
    type: "first" | "milestone";
  }[];
  totalGifts: number;
}

const REQUIRED_ENV_VARS = {
  NFT_CONTRACT: import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
  GIFTS_CONTRACT: import.meta.env.VITE_GIFTS_CONTRACT_ADDRESS,
} as const;

const validateEnvVars = () => {
  const missing = Object.entries(REQUIRED_ENV_VARS).filter(
    ([_, value]) => !value
  );
  if (missing.length > 0) {
    console.error(
      "Missing required environment variables:",
      missing.map(([key]) => `VITE_${key}`).join(", ")
    );
    return false;
  }
  return true;
};

// Update rank names to be celebration-neutral
const getGiftRank = (points: number) => {
  if (points >= 1000) return "Gift Master";
  if (points >= 500) return "Generous Soul";
  if (points >= 250) return "Joy Bringer";
  if (points >= 100) return "Celebrator";
  if (points >= 50) return "Gift Giver";
  return "Newcomer";
};

export const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = usePrivy();
  const { userProfile } = useUserProfile();
  const { contract: nftContract } = useContract(
    import.meta.env.VITE_NFT_CONTRACT_ADDRESS
  );
  const { contract: giftsContract } = useContract(
    import.meta.env.VITE_GIFTS_CONTRACT_ADDRESS
  );

  useEffect(() => {
    if (!validateEnvVars()) {
      setLoading(false);
      return;
    }

    const fetchLeaderboard = async () => {
      if (!nftContract || !giftsContract) {
        console.log("Contracts not ready yet");
        return;
      }

      try {
        setLoading(true);

        // Get the latest block number
        const provider = new ethers.providers.JsonRpcProvider(
          "https://sepolia.base.org"
        );
        const latestBlock = await provider.getBlockNumber();

        // Get all NFT transfers (for first gift NFTs)
        const filter = nftContract.filters.Transfer();

        // Function to get events in chunks to avoid RPC limitations
        const getEventsInChunks = async (
          filter: any,
          startBlock: number,
          latestBlock: number
        ) => {
          const CHUNK_SIZE = 40000;
          let events = [];
          let fromBlock = Math.max(0, latestBlock - 200000); // Last ~200k blocks

          while (fromBlock <= latestBlock) {
            const toBlock = Math.min(fromBlock + CHUNK_SIZE - 1, latestBlock);

            try {
              const chunk = await nftContract.queryFilter(
                filter,
                fromBlock,
                toBlock
              );
              events = [...events, ...chunk];
              console.log(
                `Fetched ${chunk.length} events from blocks ${fromBlock} to ${toBlock}`
              );
            } catch (error) {
              console.error(
                `Error fetching events from blocks ${fromBlock} to ${toBlock}:`,
                error
              );
            }

            fromBlock = toBlock + 1;
          }
          return events;
        };

        // Get all NFT transfers
        const transferEvents = await getEventsInChunks(
          filter,
          Math.max(0, latestBlock - 200000),
          latestBlock
        );

        // Get all gift events
        const giftFilter = giftsContract.filters.GiftSent();
        const giftEvents = await getEventsInChunks(
          giftFilter,
          Math.max(0, latestBlock - 200000),
          latestBlock
        );

        // Process gift events to count gifts by sender
        const giftsBySender: Record<string, number> = {};
        giftEvents.forEach((event) => {
          const sender = ethers.utils.defaultAbiCoder
            .decode(["address"], event.topics[1])[0]
            .toLowerCase();
          giftsBySender[sender] = (giftsBySender[sender] || 0) + 1;
        });

        // Process NFT transfers to track ownership
        const nftOwners = new Map<string, string[]>();
        transferEvents.forEach((event) => {
          const to = ethers.utils.defaultAbiCoder
            .decode(["address"], event.topics[2])[0]
            .toLowerCase();
          const tokenId = event.topics[3];
          if (to) {
            if (!nftOwners.has(to)) {
              nftOwners.set(to, []);
            }
            nftOwners.get(to)?.push(tokenId);
          }
        });

        // Combine data for leaderboard
        const allAddresses = new Set([
          ...Object.keys(giftsBySender),
          ...Array.from(nftOwners.keys()),
        ]);

        // Create leaderboard entries based on NFT ownership and gifts
        const leaderboardEntries = Array.from(allAddresses).map((address) => ({
          address: `${address.slice(0, 6)}...${address.slice(-4)}`,
          nickname: `Gift Giver ${address.slice(0, 4)}`, // Simple nickname for now
          points: (nftOwners.get(address)?.length || 0) * 50, // 50 points per NFT
          rank: getGiftRank((nftOwners.get(address)?.length || 0) * 50),
          nfts: Array.from(nftOwners.get(address) || []).map((tokenId) => ({
            tokenId,
            image: generateNFTImage("first"),
            type: "first" as const,
          })),
          totalGifts: giftsBySender[address] || 0,
        }));

        const sortedEntries = leaderboardEntries.sort(
          (a, b) => b.points - a.points
        );
        setEntries(sortedEntries);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [nftContract, giftsContract]);

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-amber-100">
      <div className="flex items-center gap-2 mb-6">
        <TrophyIcon className="w-6 h-6 text-amber-500" />
        <h2 className="text-xl font-bold text-amber-700">Gift Leaderboard</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-amber-600">
          No gifts have been sent yet. Be the first to send a gift!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-200">
                <th className="px-4 py-2 text-left text-amber-700">Rank</th>
                <th className="px-4 py-2 text-left text-amber-700">User</th>
                <th className="px-4 py-2 text-left text-amber-700">Points</th>
                <th className="px-4 py-2 text-left text-amber-700">Gifts</th>
                <th className="px-4 py-2 text-left text-amber-700">NFTs</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                const isCurrentUser =
                  user?.wallet?.address &&
                  entry.address
                    .toLowerCase()
                    .includes(user.wallet.address.slice(-4).toLowerCase());

                return (
                  <tr
                    key={index}
                    className={`border-b border-amber-100 ${
                      isCurrentUser ? "bg-amber-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-amber-800">
                      {index + 1}
                      {index < 3 && (
                        <span className="ml-1">
                          {index === 0
                            ? "🏆"
                            : index === 1
                            ? "🥈"
                            : index === 2
                            ? "🥉"
                            : ""}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-amber-800">
                          {isCurrentUser
                            ? userProfile?.nickname
                            : entry.nickname}
                        </span>
                        <span className="text-xs text-amber-500">
                          {entry.address}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-amber-800">
                          {entry.points}
                        </span>
                        <span className="text-xs text-amber-500">
                          {entry.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-amber-800">
                      {entry.totalGifts}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-2">
                        {entry.nfts.slice(0, 3).map((nft, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-xs"
                            title="Gift NFT"
                          >
                            🎁
                          </div>
                        ))}
                        {entry.nfts.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-xs text-amber-700">
                            +{entry.nfts.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
