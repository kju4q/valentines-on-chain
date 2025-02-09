import { TwitterHandler } from "../services/twitter/TwitterHandler";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function processSpecificTweet() {
  // Initialize Twitter handler
  const handler = new TwitterHandler(
    process.env.TWITTER_API_KEY!,
    process.env.TWITTER_API_SECRET!,
    process.env.TWITTER_ACCESS_TOKEN!,
    process.env.TWITTER_ACCESS_SECRET!,
    false
  );

  // Initialize blockchain connection
  const provider = new ethers.providers.JsonRpcProvider(
    "https://base-sepolia-rpc.publicnode.com"
  );
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  console.log("🔑 Using wallet:", signer.address);
  handler.initTransactionService(signer);

  // Process your specific tweet
  const tweet =
    "hey @0xaibff, send 0x0faA184088b9de78494425441cc842c577869f25 0.0001 ETH";

  console.log("💝 Processing Valentine's transaction...");
  await handler.handleTweet(tweet);
}

// Run it once
console.log("🚀 Starting Valentine's transaction...");
processSpecificTweet()
  .then(() => console.log("✅ Valentine's transaction completed"))
  .catch(console.error);
