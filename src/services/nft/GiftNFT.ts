import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Contract } from "ethers";

export class GiftNFT {
  private sdk: ThirdwebSDK;
  private contract: any;

  constructor() {
    this.sdk = new ThirdwebSDK("base-sepolia");
    this.contract = this.sdk.getContract("your-nft-contract-address");
  }

  async mintGiftNFT(recipient: string, giftAmount: string) {
    try {
      await this.contract.erc721.mint({
        name: "Valentine Gift NFT",
        description: `Gifted ${giftAmount} with love`,
        image: "ipfs://your-image-url",
        attributes: [
          { trait_type: "Amount", value: giftAmount },
          { trait_type: "Date", value: new Date().toISOString() },
        ],
      });
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  }

  async handleGiftNFT(sender: string, value: string) {
    try {
      const hasFirstGiftNFT = await this.contract.call(
        "hasReceivedFirstGiftNFT",
        [sender]
      );

      if (!hasFirstGiftNFT) {
        await this.mintGiftNFT(sender, value);
        await this.tweetFirstGift(sender, value);
      }
    } catch (error) {
      console.error("Error handling gift NFT:", error);
      throw error;
    }
  }
}
