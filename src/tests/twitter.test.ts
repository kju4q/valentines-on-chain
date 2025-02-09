import { MockTwitterAPI } from "../services/twitter/MockTwitterAPI";
import { ethers } from "ethers";
import dotenv from "dotenv";

// Load environment variables from main .env file
dotenv.config();

const NETWORK = "base-sepolia"; // Change to "base" for mainnet

async function testTwitterScenarios() {
  const twitter = new MockTwitterAPI();

  try {
    // Test regular tweets first
    console.log("\n🧪 Testing Regular Tweets:");
    const firstGiftTweet = await twitter.tweet(`
🌹 Based Valentine Gift from 0xHopelessRomantic
💝 0.1 ETH sent with love
just vibes on Base
    `);
    console.log("✅ Regular tweet sent:", firstGiftTweet.id);

    // Verify environment variables are loaded
    if (!process.env.PRIVATE_KEY) {
      throw new Error("Missing required environment variables in .env");
    }

    // Initialize transaction service for command testing
    console.log("\n🧪 Testing Command Tweets:");
    const provider = new ethers.providers.JsonRpcProvider(
      NETWORK === "base-sepolia"
        ? "https://base-sepolia-rpc.publicnode.com"
        : "https://mainnet.base.org"
    );
    const testSigner = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("🔑 Using test wallet:", testSigner.address);
    console.log("🌍 Network:", NETWORK);

    twitter.initTransactionService(testSigner, "");

    // Test cases based on network
    const testCases = [
      // Natural language commands
      "hey aibff send 0.0001 to 0x0faA184088b9de78494425441cc842c577869f25",
      "@aibff send 0.0001 eth to 0x0faA184088b9de78494425441cc842c577869f25",
      "aibff please send 0.0001 to 0x0faA184088b9de78494425441cc842c577869f25",
    ];

    for (const tweet of testCases) {
      console.log(`\n🔍 Testing command tweet: "${tweet}"`);
      const result = await twitter.tweet(tweet);
      console.log("✅ Command tweet processed:", result.id);
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
testTwitterScenarios()
  .then(() => {
    console.log("\n🎉 All test scenarios completed");
  })
  .catch(console.error);
