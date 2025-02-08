export const VALENTINE_GIFTS_ADDRESS =
  "0xf76e9Ad188c4eb1Fea69B25CabafB9930EA5DF8E";
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
