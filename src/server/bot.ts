import { TwitterHandler } from "../services/twitter/TwitterHandler";
import dotenv from "dotenv";

dotenv.config();
const bot = new TwitterHandler();

console.log("🤖 Starting AIBFF Bot...");
console.log("Listening for tweets mentioning @aibff...");

console.log("🤖 Starting AI Valentine Bot...");
bot.startBot().catch((error) => {
  console.error("Bot failed to start:", error);
  process.exit(1);
});
