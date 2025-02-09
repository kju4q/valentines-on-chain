import { TwitterHandler } from "../services/twitter/TwitterHandler";
import { ethers } from "ethers";
import dotenv from "dotenv";

// Load environment variables from main .env file
dotenv.config();

const NETWORK = "base-sepolia"; // Change to "base" for mainnet

async function testValentineBot() {
  console.log("\n🧪 Testing Valentine's Bot");

  try {
    // Initialize Twitter handler in test mode
    const handler = new TwitterHandler(
      "test_key",
      "test_secret",
      "test_token",
      "test_secret",
      true // Test mode
    );

    // Initialize blockchain connection
    const provider = new ethers.providers.JsonRpcProvider(
      NETWORK === "base-sepolia"
        ? "https://base-sepolia-rpc.publicnode.com"
        : "https://mainnet.base.org"
    );

    // Use test private key from .env.test
    const signer = new ethers.Wallet(
      process.env.TEST_PRIVATE_KEY || "0x123...",
      provider
    );

    console.log("🔑 Using test wallet:", signer.address);
    console.log("🌍 Network:", NETWORK);
    handler.initTransactionService(signer);

    // Test different tweet formats
    const testTweets = [
      "hey @0xaibff, send 0x0faA184088b9de78494425441cc842c577869f25 0.0001 ETH",
      "hey @0xaibff send vitalik.eth 0.001 ETH",
      "invalid tweet format",
    ];

    for (const tweet of testTweets) {
      console.log("\n📝 Testing tweet:", tweet);
      await handler.handleTweet(tweet);
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Rate limit exceeded") {
      console.log("✅ Rate limit handling works as expected");
    } else {
      console.error("❌ Test failed:", error);
    }
  }
}

// Run tests
console.log("🚀 Starting Valentine's Bot Tests");
testValentineBot()
  .then(() => console.log("\n✅ All tests completed"))
  .catch(console.error);
