import { useState, useEffect } from "react";
import { TrophyIcon } from "@heroicons/react/24/outline";
import { useContract } from "@thirdweb-dev/react";
import { generateNFTImage } from "../services/nft/NFTDesigns";
import { ethers } from "ethers";
import { usePrivy } from "@privy-io/react-auth";
import { VALENTINE_NICKNAMES } from "../contexts/UserProfileContext";
import { useUserProfile } from "../contexts/UserProfileContext";
import { generateNickname } from "../utils/nicknames";

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

const getLoveRank = (points: number) => {
  if (points >= 1000) return "Cupid";
  if (points >= 500) return "Angel";
  if (points >= 250) return "Romeo";
  if (points >= 100) return "Poet";
  if (points >= 50) return "Lover";
  return "Admirer";
};

export const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { contract } = useContract(import.meta.env.VITE_NFT_CONTRACT_ADDRESS);
  const { user } = usePrivy();
  const { userProfile } = useUserProfile();

  const fetchEvents = async (
    nftContract: ethers.Contract,
    filter: any,
    latestBlock: number
  ) => {
    const CHUNK_SIZE = 40000;
    let events = [];
    let fromBlock = Math.max(0, latestBlock - 200000); // Last ~200k blocks

    while (fromBlock <= latestBlock) {
      const toBlock = Math.min(fromBlock + CHUNK_SIZE, latestBlock);
      try {
        const chunk = await nftContract.queryFilter(filter, fromBlock, toBlock);
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

  useEffect(() => {
    if (!validateEnvVars()) return;

    const fetchLeaderboard = async () => {
      if (!contract || !user?.wallet) return;

      // Check if we have both contract addresses
      const nftContractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;

      if (!nftContractAddress) {
        console.error("Missing contract addresses in .env file");
        return;
      }

      setLoading(true);
      try {
        const provider = new ethers.providers.JsonRpcProvider(
          "https://base-sepolia-rpc.publicnode.com"
        );

        // Create contract instances for both contracts
        const nftContract = new ethers.Contract(
          nftContractAddress,
          [
            "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
            "event MilestoneAdded(uint256 indexed tokenId, address indexed sender, uint256 giftValue, string milestone)",
          ],
          provider
        );

        const latestBlock = await provider.getBlockNumber();
        console.log("Latest block:", latestBlock);

        try {
          // Get transfer and milestone events
          const [transferEvents, milestoneEvents] = await Promise.all([
            fetchEvents(
              nftContract,
              nftContract.filters.Transfer(),
              latestBlock
            ),
            fetchEvents(
              nftContract,
              nftContract.filters.MilestoneAdded(),
              latestBlock
            ),
          ]);

          console.log("NFT Transfer events:", transferEvents);
          console.log("Milestone events:", milestoneEvents);

          // Track gifts by sender
          const giftsBySender = milestoneEvents.reduce((acc, event) => {
            console.log("Processing milestone event:", event);
            const sender = event.topics?.[2]; // topics[2] is the indexed sender address
            if (sender) {
              const address = ethers.utils.defaultAbiCoder
                .decode(["address"], sender)[0]
                .toLowerCase();
              const giftValue = ethers.utils.defaultAbiCoder.decode(
                ["uint256"],
                event.data
              )[0];
              console.log(`Found gift from ${address} with value ${giftValue}`);
              acc[address] = (acc[address] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>);

          console.log("Final gifts by sender:", giftsBySender);

          // Track NFT owners
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
          const leaderboardEntries = Array.from(allAddresses).map(
            (address) => ({
              address: `${address.slice(0, 6)}...${address.slice(-4)}`,
              nickname: generateNickname(address),
              points: (nftOwners.get(address)?.length || 0) * 50, // 50 points per NFT
              rank: getLoveRank((nftOwners.get(address)?.length || 0) * 50),
              nfts: Array.from(nftOwners.get(address) || []).map((tokenId) => ({
                tokenId,
                image: generateNFTImage("first"),
                type: "first" as const,
              })),
              totalGifts: giftsBySender[address] || 0,
            })
          );

          const sortedEntries = leaderboardEntries.sort(
            (a, b) => b.points - a.points
          );
          setEntries(sortedEntries);
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [contract, user?.wallet, userProfile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <span className="animate-spin text-2xl">🌸</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-pink-600 flex items-center justify-center gap-2">
          <TrophyIcon className="w-6 h-6" />
          Valentine's Hall of Love
        </h2>
      </div>

      <div className="bg-white/30 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 bg-pink-500 text-white font-semibold">
          <div className="col-span-2">Valentine</div>
          <div className="text-center">Rank</div>
          <div className="text-center">NFTs</div>
          <div className="text-center">Points</div>
        </div>

        <div className="divide-y divide-pink-100">
          {entries.map((entry, index) => (
            <div
              key={entry.address}
              className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-white/40 transition-colors"
            >
              <div className="col-span-2">
                <div className="font-medium text-pink-600">
                  {entry.nickname}
                </div>
                <div className="text-sm text-pink-500/80">{entry.address}</div>
              </div>
              <div className="text-center font-medium text-pink-600">
                {entry.rank}
              </div>
              <div className="text-center flex justify-center gap-1">
                {entry.nfts.length > 0 ? (
                  <div className="flex -space-x-2">
                    {entry.nfts.map((nft) => (
                      <div
                        key={nft.tokenId}
                        className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white hover:z-10 transition-all transform hover:scale-110"
                        title={`NFT #${nft.tokenId}`}
                      >
                        <img
                          src={nft.image}
                          alt={`NFT #${nft.tokenId}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-pink-600/50">No NFTs</span>
                )}
              </div>
              <div className="text-center font-bold text-pink-600">
                {entry.points}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
