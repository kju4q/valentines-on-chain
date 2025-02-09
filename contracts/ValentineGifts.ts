export const VALENTINE_GIFTS_ADDRESS =
  "0x3EE70cFc42108714AA6aC6BA4f9b38c22D19744c";
export const USDC_ADDRESS = "0x036CBD53842c5426634e7929541ec2318F3DCF7C";

export const VALENTINE_GIFTS_ABI = [
  "function sendEthGift(address to) external payable",
  "function sendUsdcGift(address to, uint256 amount) external",
  "function giftSheFiCourse(address to) external",
  "event CryptoGiftSent(address indexed from, address indexed to, uint256 amount, bool isEth)",
  "event SheFiGiftSent(address indexed from, address indexed to)",
] as const;

export const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
] as const;
