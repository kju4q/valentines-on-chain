import { ENSResolver } from "../ens/ENSResolver";
import { USDCService } from "../tokens/USDCService";
import { ethers } from "ethers";

export class TransactionService {
  private ensResolver: ENSResolver;
  private usdcService: USDCService;
  private signer: ethers.Signer;
  private lastNonce: number = -1;

  constructor(signer: ethers.Signer, usdcAddress: string) {
    this.ensResolver = new ENSResolver();
    this.usdcService = new USDCService(usdcAddress, signer);
    this.signer = signer;
  }

  async sendToken(recipient: string, amount: number, token: "ETH" | "USDC") {
    try {
      // Resolve recipient address
      const resolvedAddress = await this.ensResolver.resolveAddress(recipient);
      if (!resolvedAddress) {
        throw new Error(`Could not resolve address for ${recipient}`);
      }

      // Get the next nonce
      const currentNonce = await this.signer.getTransactionCount("latest");
      const nonce = Math.max(currentNonce, this.lastNonce + 1);
      this.lastNonce = nonce;

      // Send the appropriate token
      if (token === "USDC") {
        return await this.usdcService.sendUSDC(resolvedAddress, amount);
      } else {
        // Send ETH
        const amountInWei = ethers.utils.parseEther(amount.toString());
        return await this.signer.sendTransaction({
          to: resolvedAddress,
          value: amountInWei,
          nonce: nonce, // Explicitly set the nonce
        });
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  }

  // Add method to wait for transaction confirmation
  async waitForTransaction(tx: ethers.providers.TransactionResponse) {
    try {
      await tx.wait(1); // Wait for 1 confirmation
      return true;
    } catch (error) {
      console.error("Transaction failed to confirm:", error);
      return false;
    }
  }
}
