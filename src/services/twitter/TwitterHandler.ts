import {
  TwitterApi,
  TwitterApiReadWrite,
  TweetV2,
  ApiResponseError,
} from "twitter-api-v2";
import OpenAI from "openai";
import { generateDeeplink } from "../../utils/deeplink";
import { GiftAdvisor } from "../ai/GiftAdvisor";

interface ParsedCommand {
  amount: string;
  token: "ETH" | "USDC";
  recipient: string;
}

interface TweetData {
  id: string;
  text: string;
}

export class TwitterHandler {
  #client: TwitterApiReadWrite;
  #giftAdvisor: GiftAdvisor;
  #lastProcessedId: string | undefined;
  #isProcessing: boolean = false;

  constructor() {
    // Initialize with OAuth 1.0a
    this.#client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY || "",
      appSecret: process.env.TWITTER_API_SECRET || "",
      accessToken: process.env.TWITTER_ACCESS_TOKEN || "",
      accessSecret: process.env.TWITTER_ACCESS_SECRET || "",
    }).readWrite;

    this.#giftAdvisor = new GiftAdvisor();
  }

  public async startListening(): Promise<void> {
    console.log("Starting Twitter bot...");
    try {
      // Initial check with error handling
      await this.checkMentions(true);

      console.log(
        "Twitter bot is now ready! Checking mentions every 15 minutes..."
      );

      // Poll for new mentions with increased interval
      setInterval(async () => {
        if (!this.#isProcessing) {
          await this.checkMentions(false);
        }
      }, 900000); // Check every 15 minutes (900000ms)
    } catch (error) {
      console.error("Failed to start Twitter bot:", error);
      // Attempt to reconnect after a longer delay
      setTimeout(() => this.startListening(), 60000); // 1 minute delay
    }
  }

  private async checkMentions(isInitial: boolean): Promise<void> {
    try {
      this.#isProcessing = true;
      // Add delay before making the API call
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const mentions = await this.#client.v2.search("@aibff", {
        ...(this.#lastProcessedId && !isInitial
          ? { since_id: this.#lastProcessedId }
          : {}),
        "tweet.fields": ["created_at"],
        max_results: 10, // Must be at least 10
      });

      const tweets = mentions.tweets;

      if (tweets && tweets.length > 0) {
        // Update last processed ID
        this.#lastProcessedId = tweets[0].id;

        // Process mentions in reverse order (oldest first)
        const tweetsToProcess = [...tweets].reverse();
        for (const tweet of tweetsToProcess) {
          try {
            await this.handleTweet(tweet);
            // Add delay between processing tweets
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } catch (error) {
            console.error(`Error processing tweet ${tweet.id}:`, error);
          }
        }
      }
    } catch (error) {
      if (error instanceof ApiResponseError) {
        if (error.code === 429) {
          console.log("Rate limit reached. Will retry in 15 minutes.");
        } else {
          console.error("Twitter API error:", error.data);
        }
      } else {
        console.error("Error checking mentions:", error);
      }
    } finally {
      this.#isProcessing = false;
    }
  }

  private async handleTweet(tweet: TweetV2): Promise<void> {
    try {
      const command = this.parseCommand(tweet.text);
      if (!command) {
        await this.#client.v2.reply(
          "💫 Hey! Try this format: @aibff send 0.01 ETH to @username",
          tweet.id
        );
        return;
      }

      const aiMessage = await this.#giftAdvisor.generateMessage({
        amount: Number(command.amount),
        token: command.token,
        recipient: command.recipient,
      });

      const giftLink = generateDeeplink({
        amount: command.amount,
        token: command.token,
        recipient: command.recipient,
        message: aiMessage,
      });

      await this.#client.v2.reply(
        `💝 Here's your Valentine's gift link for @${command.recipient}:\n\n${giftLink}\n\n${aiMessage}`,
        tweet.id
      );
    } catch (error) {
      console.error("Error handling tweet:", error);
      await this.#client.v2.reply(
        "💔 Oops! Something went wrong. Please try again!",
        tweet.id
      );
    }
  }

  private parseCommand(text: string): ParsedCommand | null {
    // Match any tweet that contains our bot mention, an amount, ETH/USDC, and a username
    const regex =
      /(?:^|\s)@aibff(?:\s+\w+)*\s+send\s+(\d+(?:\.\d+)?)\s*(ETH|USDC)(?:\s+\w+)*\s+to\s+@?(\w+)/i;
    const match = text.match(regex);
    if (!match) return null;
    return {
      amount: match[1],
      token: match[2].toUpperCase() as "ETH" | "USDC",
      recipient: match[3].replace("@", ""),
    };
  }
}
