import { TwitterApi } from "twitter-api-v2";
import { GiftAdvisor } from "../ai/GiftAdvisor";

interface CommandParams {
  amount?: string;
  token?: "ETH" | "USDC"; // Removed SHEFI as we're focusing on crypto gifts
  recipient: string;
}

interface DeepLinkParams {
  amount: number;
  token: string;
  recipient: string;
}

export class TwitterDeepLinkService {
  private client: TwitterApi;
  private giftAdvisor: GiftAdvisor;
  private baseUrl = "https://valentines.finance"; // Our platform URL

  constructor() {
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });

    this.giftAdvisor = new GiftAdvisor();
  }

  public startListening() {
    const stream = this.client.v1.stream.getStream("statuses/filter.json", {
      track: ["@aibff"], // Our bot handle
    });

    stream.on("data", async (tweet: any) => {
      if (tweet.text && tweet.user.screen_name !== "aibff") {
        const command = this.parseCommand(tweet.text);
        if (command) {
          await this.handleCommand(command, tweet.id_str);
        }
      }
    });
  }

  private parseCommand(text: string): CommandParams | null {
    // Match: @aibff send 10 ETH to @username
    const regex =
      /@aibff\s+send\s+(\d+(?:\.\d+)?)\s*(ETH|USDC)\s+to\s+@?(\w+)/i;
    const match = text.match(regex);

    if (!match) return null;

    return {
      amount: match[1],
      token: match[2].toUpperCase() as "ETH" | "USDC",
      recipient: match[3],
    };
  }

  private async handleCommand(command: CommandParams, tweetId: string) {
    try {
      // Generate AI message for the gift
      const aiMessage = await this.giftAdvisor.generateMessage({
        amount: Number(command.amount || "0"),
        token: command.token || "ETH",
        recipient: command.recipient,
      });

      // Create deep link with all parameters
      const queryParams = new URLSearchParams({
        amount: command.amount || "",
        token: (command.token || "ETH").toLowerCase(),
        to: command.recipient,
        message: aiMessage,
      });

      const deepLink = `${this.baseUrl}/send?${queryParams.toString()}`;

      // Create tweet reply with the deep link
      const replyText = `💝 Here's your Valentine's gift link for @${command.recipient}:\n\n${deepLink}\n\n${aiMessage}`;

      // Post reply
      await this.client.v2.reply(replyText, tweetId);
    } catch (error) {
      console.error("Error handling command:", error);
      // Reply with error message
      await this.client.v2.reply(
        "💔 Oops! Something went wrong. Please try again!",
        tweetId
      );
    }
  }
}
