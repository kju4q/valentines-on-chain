import { useContract, useNFTs } from "@thirdweb-dev/react";
import { useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
import { baseSepolia } from "../App"; // Import the chain config
import { generateNFTImage } from "../services/nft/NFTDesigns";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useCelebrationNFTs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { contract } = useContract(import.meta.env.VITE_NFT_CONTRACT_ADDRESS);
  const { data: nfts, isLoading: nftsLoading } = useNFTs(contract);

  const mintFirstGiftNFT = async (address: string) => {
    if (!contract || !user?.wallet || !wallets?.[0]) {
      console.error("No contract, wallet, or connected wallet");
      return;
    }

    try {
      // Check if user already has a first-gift NFT
      const hasFirstGiftNFT = await contract.call("hasReceivedFirstGiftNFT", [
        address,
      ]);
      if (hasFirstGiftNFT) {
        console.log("User already has first gift NFT");
        return;
      }

      setIsLoading(true);
      const wallet = wallets[0];
      await wallet.switchChain(84532);

      // Get the provider and signer
      const privyProvider = await wallet.getEthereumProvider();
      const provider = new ethers.providers.Web3Provider(privyProvider);
      const signer = provider.getSigner();

      // Create SDK with signer and clientId
      const sdk = ThirdwebSDK.fromSigner(signer, baseSepolia, {
        clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
      });

      // Get contract with signer
      const nftContract = await sdk.getContract(
        import.meta.env.VITE_NFT_CONTRACT_ADDRESS
      );

      console.log("Contract ready:", nftContract);

      // Use a data URI for a celebration-themed image
      const metadata = {
        name: "First Gift Celebration",
        description: "Awarded for sending your first gift!",
        image: generateNFTImage("first"),
        properties: {
          type: "first_gift",
          timestamp: new Date().toISOString(),
        },
      };

      // Mint NFT
      const result = await nftContract.erc721.mint({
        ...metadata,
        to: address,
      });

      return {
        txHash: result.receipt.transactionHash,
        tokenId: result.id.toString(),
        receipt: result.receipt,
      };
    } catch (error) {
      console.error("Failed to mint first gift NFT:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const mintMilestoneNFT = async (address: string, milestone: number) => {
    if (!contract || !wallets?.[0]) return;
    setIsLoading(true);
    try {
      const wallet = wallets[0];
      // Switch to Base Sepolia
      await wallet.switchChain(84532);

      // Get the provider and signer
      const privyProvider = await wallet.getEthereumProvider();
      const provider = new ethers.providers.Web3Provider(privyProvider);
      const signer = provider.getSigner();

      // Create SDK with signer
      const sdk = ThirdwebSDK.fromSigner(signer, baseSepolia);

      // Get contract with signer
      const nftContract = await sdk.getContract(
        import.meta.env.VITE_NFT_CONTRACT_ADDRESS
      );

      await nftContract.erc721.mint({
        name: `${milestone}th Gift Milestone`,
        description: `Awarded for sending your ${milestone}th gift!`,
        image: generateNFTImage("milestone"),
        properties: {
          type: "milestone",
          count: milestone,
          timestamp: new Date().toISOString(),
        },
        to: address,
      });
    } catch (error) {
      console.error("Failed to mint milestone NFT:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    nfts,
    isLoading: isLoading || nftsLoading,
    mintFirstGiftNFT,
    mintMilestoneNFT,
  };
};
