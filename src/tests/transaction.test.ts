import { AIBestFriend } from "../services/ai/AIBestFriend";
import dotenv from "dotenv";
import { ApiResponseError } from "twitter-api-v2";
import { TwitterApi } from "twitter-api-v2";

dotenv.config();

// Add delay helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Add timestamp check
const checkRateLimit = async (twitter: TwitterApi) => {
  try {
    // Try to get user info
    await twitter.v2.me();

    // If we get here, we're not rate limited
    console.log("Rate limit check passed ✅");
    return true;
  } catch (error) {
    if (error instanceof ApiResponseError) {
      if (error.code === 429 || error.code === 88) {
        const resetTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
        console.log(
          `Rate limited. Please wait until ${resetTime.toLocaleTimeString()}`
        );
      } else {
        console.log("Twitter API Error:", error.data);
      }
    } else {
      console.log("Couldn't check rate limit status:", error);
    }
    return false;
  }
};

// Add retry helper with daily limits in mind
const retryWithDelay = async <T>(
  fn: () => Promise<T>,
  retries = 2, // Reduced retries due to daily limit
  delay = 300000 // 5 minutes
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || !(error instanceof ApiResponseError)) throw error;

    if (error.code === 429 || error.code === 88) {
      const minutes = delay / 1000 / 60;
      console.log(
        `Rate limited (${
          17 - retries
        }/17 daily tweets used). Waiting ${minutes} minutes before retry...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithDelay(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
};

async function testTransaction() {
  console.log("🧪 Testing transaction...");
  const isTestMode = process.env.TEST_MODE === "true";

  const aibff = new AIBestFriend(
    process.env.VITE_OPENAI_API_KEY!,
    process.env.TWITTER_API_KEY!,
    process.env.TWITTER_API_SECRET!,
    process.env.TWITTER_ACCESS_TOKEN!,
    process.env.TWITTER_ACCESS_SECRET!,
    process.env.BOT_PRIVATE_KEY!,
    "https://sepolia.base.org"
  );

  try {
    // Skip rate limit check in test mode
    if (!isTestMode) {
      const canProceed = await checkRateLimit(aibff.getTwitterClient());
      if (!canProceed) {
        console.log("Skipping test due to rate limit");
        return;
      }
    }

    // In test mode, we don't need to create a real tweet
    const testTweetId = "test_" + Date.now();

    // Try to send ETH with retry
    await retryWithDelay(async () => {
      await aibff.handleTweet(
        testTweetId,
        "@aibff send 0xa976AD42a289DF918C9746de4D1cFb757ACECFD0 0.0005 eth",
        "987654321"
      );
    });

    console.log("Transaction test completed!");
  } catch (error) {
    console.error("Error:", error);
  }
}

testTransaction().catch(console.error);
