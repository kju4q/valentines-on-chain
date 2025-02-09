import { AIBestFriend } from "../services/ai/AIBestFriend";
import dotenv from "dotenv";
import { ApiResponseError } from "twitter-api-v2";

dotenv.config();

// Add timeout helper
const withTimeout = async (promise: Promise<any>, ms: number) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Operation timed out")), ms)
  );
  return Promise.race([promise, timeout]);
};

async function testAIBFF() {
  console.log("🤖 Testing AIBFF...");

  const aibff = new AIBestFriend(
    process.env.VITE_OPENAI_API_KEY!,
    process.env.TWITTER_API_KEY!,
    process.env.TWITTER_API_SECRET!,
    process.env.TWITTER_ACCESS_TOKEN!,
    process.env.TWITTER_ACCESS_SECRET!,
    process.env.BOT_PRIVATE_KEY!,
    "https://sepolia.base.org"
  );

  // Test 1: Parse Command
  console.log("\n🧪 Testing command parsing...");
  const testTweets = [
    "@aibff send 0x123...abc 0.1 eth",
    "@aibff send vitalik.eth 5 usdc",
    "@aibff hello world", // Should fail
  ];

  for (const tweet of testTweets) {
    try {
      const command = (aibff as any).parseCommand(tweet);
      console.log(`Tweet: ${tweet}`);
      console.log(`Parsed:`, command);
    } catch (error) {
      console.error(`Error parsing tweet: ${tweet}`);
      console.error(error);
    }
  }

  // Test 2: Message Generation
  console.log("\n🧪 Testing message generation...");
  try {
    console.log("Waiting for OpenAI response (timeout: 10s)...");
    const message = await withTimeout(
      (aibff as any).generateMessage({
        type: "send",
        recipient: "sarah.eth",
        amount: "0.1",
        token: "eth",
      }),
      10000
    );
    console.log("AI Message:", message);
  } catch (error: unknown) {
    console.error("Error generating message:");
    if (error instanceof Error) {
      if (error.message === "Operation timed out") {
        console.error(
          "OpenAI API call timed out. Check your API key and network connection."
        );
      } else {
        console.error(error.message);
      }
    } else {
      console.error("Unknown error:", error);
    }
    process.exit(1);
  }

  // Test 3: Full Tweet Handler
  console.log("\n🧪 Testing tweet handler...");
  try {
    console.log("Testing tweet handling (timeout: 15s)...");

    // First create a test tweet
    const tweet = await aibff
      .getTwitterClient()
      .v2.tweet("Test tweet for AIBFF");
    console.log("Created test tweet:", tweet.data.id);

    // Now try to reply to it
    await withTimeout(
      aibff.handleTweet(
        tweet.data.id, // Use the real tweet ID
        "@aibff send sarah.eth 0.1 eth",
        "987654321"
      ),
      15000
    );

    console.log("Tweet handled successfully!");

    // Clean up - delete test tweet
    try {
      await aibff.getTwitterClient().v2.deleteTweet(tweet.data.id);
    } catch (cleanupError) {
      console.log("Note: Could not delete test tweet");
    }
  } catch (error: unknown) {
    if (error instanceof ApiResponseError) {
      console.error("Twitter API Error:", error.data);
    } else if (error instanceof Error) {
      console.error("Error handling tweet:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    process.exit(1);
  }
}

// Run tests
testAIBFF().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error("Test failed:", error.message);
  } else {
    console.error("Test failed with unknown error:", error);
  }
  process.exit(1);
});
