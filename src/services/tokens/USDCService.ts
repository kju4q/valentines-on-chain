import { ethers } from "ethers";

const USDC_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

export class USDCService {
  private contract: ethers.Contract;

  constructor(usdcAddress: string, signer: ethers.Signer) {
    this.contract = new ethers.Contract(usdcAddress, USDC_ABI, signer);
  }

  async sendUSDC(to: string, amount: number) {
    const decimals = 6; // USDC has 6 decimals
    const amountInWei = ethers.utils.parseUnits(amount.toString(), decimals);
    return this.contract.transfer(to, amountInWei);
  }
}
