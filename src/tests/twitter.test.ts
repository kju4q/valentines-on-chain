import { TwitterApi, ApiResponseError } from "twitter-api-v2";
import dotenv from "dotenv";

dotenv.config();

async function testTwitterAuth() {
  console.log("🐦 Testing Twitter Authentication...");

  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });

  try {
    // Try to get own user info to test auth
    const me = await client.v2.me();
    console.log("✅ Authentication successful!");
    console.log("Bot account:", me.data);
  } catch (error: unknown) {
    if (error instanceof ApiResponseError) {
      console.error("❌ Authentication failed:", error.data);
    } else if (error instanceof Error) {
      console.error("❌ Unexpected error:", error.message);
    } else {
      console.error("❌ Unknown error:", error);
    }
  }
}

testTwitterAuth().catch((error: unknown) => {
  console.error("Fatal error:", error instanceof Error ? error.message : error);
});
