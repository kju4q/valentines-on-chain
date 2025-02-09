import { AIBestFriend } from "../services/ai/AIBestFriend";
import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";

dotenv.config();

const aibff = new AIBestFriend(
  process.env.VITE_OPENAI_API_KEY!,
  process.env.TWITTER_API_KEY!,
  process.env.TWITTER_API_SECRET!,
  process.env.TWITTER_ACCESS_TOKEN!,
  process.env.TWITTER_ACCESS_SECRET!,
  process.env.BOT_PRIVATE_KEY!,
  "https://sepolia.base.org"
);

// Start listening to tweets
const startBot = async () => {
  const twitter = aibff.getTwitterClient();

  const stream = await twitter.v2.searchStream({
    "tweet.fields": ["author_id", "referenced_tweets"],
  });

  stream.on("data", async (tweet) => {
    if (tweet.data.text.toLowerCase().includes("@aibff send")) {
      await aibff.handleTweet(
        tweet.data.id,
        tweet.data.text,
        tweet.data.author_id
      );
    }
  });
};

console.log("🤖 Starting AIBFF Bot...");
console.log("Listening for tweets mentioning @aibff...");

startBot().catch((error) => {
  console.error("Bot crashed:", error);
  process.exit(1);
});
