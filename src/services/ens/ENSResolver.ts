import { ethers } from "ethers";

export class ENSResolver {
  private provider: ethers.providers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(
      "https://base-sepolia-rpc.publicnode.com"
    );
  }

  async resolveAddress(name: string): Promise<string | null> {
    try {
      // Handle ENS names
      if (name.endsWith(".eth")) {
        const address = await this.provider.resolveName(name);
        return address;
      }

      // Handle direct addresses
      if (name.startsWith("0x")) {
        return ethers.utils.isAddress(name) ? name : null;
      }

      return null;
    } catch (error) {
      console.error("Error resolving ENS name:", error);
      return null;
    }
  }
}
