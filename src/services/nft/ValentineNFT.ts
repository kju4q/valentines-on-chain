import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";

export class ValentineNFT {
  private sdk: ThirdwebSDK;
  private contractAddress: string;

  constructor() {
    // Initialize on Base testnet
    this.sdk = new ThirdwebSDK("base-sepolia");
    this.contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
  }

  async mintFirstGiftNFT(recipientAddress: string) {
    try {
      const contract = await this.sdk.getContract(this.contractAddress);
      const nft = await contract.erc721;

      // Mint the "First Gift" NFT
      await nft.mint({
        name: "First Valentine Gift",
        description: "Awarded for sending your first Valentine's gift!",
        image: "ipfs://your-first-gift-image-hash", // We'll add the image later
        properties: {
          type: "first_gift",
          timestamp: new Date().toISOString(),
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to mint NFT:", error);
      throw error;
    }
  }

  async mintMilestoneNFT(recipientAddress: string, milestone: number) {
    try {
      const contract = await this.sdk.getContract(this.contractAddress);
      const nft = await contract.erc721;

      // Mint milestone NFT
      await nft.mint({
        name: `${milestone}th Valentine Gift`,
        description: `Awarded for sending your ${milestone}th Valentine's gift!`,
        image: `ipfs://your-milestone-${milestone}-image-hash`,
        properties: {
          type: "milestone",
          count: milestone,
          timestamp: new Date().toISOString(),
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to mint milestone NFT:", error);
      throw error;
    }
  }

  async getUserNFTs(address: string) {
    try {
      const contract = await this.sdk.getContract(this.contractAddress);
      const nft = await contract.erc721;

      const nfts = await nft.getOwned(address);
      return nfts;
    } catch (error) {
      console.error("Failed to get user NFTs:", error);
      throw error;
    }
  }

  async checkMilestone(address: string): Promise<number | null> {
    try {
      const nfts = await this.getUserNFTs(address);
      const giftCount = nfts.length;

      // Define milestones
      const milestones = [10, 25, 50, 100];

      // Check if user hit a milestone
      for (const milestone of milestones) {
        if (giftCount === milestone) {
          return milestone;
        }
      }

      return null;
    } catch (error) {
      console.error("Failed to check milestone:", error);
      throw error;
    }
  }
}
