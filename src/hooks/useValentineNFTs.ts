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

// TODO: User should get Valentine NFT only the first gift

export const useValentineNFTs = () => {
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

    setIsLoading(true);
    try {
      const wallet = wallets[0];
      // Switch to Base Sepolia
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

      // Use a data URI for a simple heart image
      const metadata = {
        name: "First Valentine Gift",
        description: "Awarded for sending your first Valentine's gift!",
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

      // Get the transaction hash and token ID
      const txHash = result.receipt.transactionHash;
      const tokenId = result.id.toString();

      console.log("Mint result:", {
        txHash,
        tokenId,
        receipt: result.receipt,
      });

      return {
        txHash,
        tokenId,
        receipt: result.receipt,
      };
    } catch (error) {
      console.error("Failed to mint NFT:", error);
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
        name: `${milestone}th Valentine Gift`,
        description: `Awarded for sending your ${milestone}th Valentine's gift!`,
        image: generateNFTImage("milestone", milestone),
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
