import { OpenAI } from "openai";
import { TwitterApi } from "twitter-api-v2";
import { ethers } from "ethers";
import {
  VALENTINE_GIFTS_ABI,
  VALENTINE_GIFTS_ADDRESS,
} from "../../../contracts/ValentineGifts";
import { MockValentineGifts } from "../../tests/mocks/ValentineGifts.mock";
import { USDC_ADDRESS, USDC_ABI } from "../../../contracts/USDC";

interface Command {
  type: "send";
  recipient: string;
  amount: string;
  token: "eth" | "usdc";
}

interface Achievement {
  name: string;
  points: number;
}

export class AIBestFriend {
  private openai: OpenAI;
  private twitter: TwitterApi;
  private contract: ethers.Contract;
  private tweetCount = 0;

  getTwitterClient(): TwitterApi {
    return this.twitter;
  }

  constructor(
    openAiKey: string,
    twitterApiKey: string,
    twitterApiSecret: string,
    twitterAccessToken: string,
    twitterAccessSecret: string,
    privateKey: string,
    rpcUrl: string
  ) {
    this.openai = new OpenAI({ apiKey: openAiKey });

    // Use OAuth 1.0a
    this.twitter = new TwitterApi({
      appKey: twitterApiKey,
      appSecret: twitterApiSecret,
      accessToken: twitterAccessToken,
      accessSecret: twitterAccessSecret,
    });

    // Use mock contract in test environment
    if (process.env.NODE_ENV === "test") {
      this.contract = MockValentineGifts as any;
    } else {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      this.contract = new ethers.Contract(
        VALENTINE_GIFTS_ADDRESS,
        VALENTINE_GIFTS_ABI,
        wallet
      );
    }
  }

  private parseCommand(tweet: string): Command | null {
    const regex = /send\s+(\S+)\s+(\d+(?:\.\d+)?)\s+(eth|usdc)/i;
    const match = tweet.match(regex);

    if (!match) return null;

    return {
      type: "send",
      recipient: match[1],
      amount: match[2],
      token: match[3].toLowerCase() as "eth" | "usdc",
    };
  }

  private async handleTweetInTestMode(
    tweetId: string,
    tweetText: string,
    sender: string
  ) {
    const command = this.parseCommand(tweetText);
    if (!command) return;

    try {
      // Validate transaction first
      await this.validateTransaction(command);

      // Generate message (we'll still use OpenAI in test mode)
      const message = await this.generateMessage(command);

      // Execute transfer
      const tx = await this.executeTransfer(command);

      // Create simulated tweet content
      const explorerUrl = `https://sepolia.basescan.org/tx/${tx.hash}`;

      console.log("\n📱 Simulated Twitter Interaction:");
      console.log("--------------------------------");
      console.log("🤖 Original Tweet:");
      console.log(`@user: ${tweetText}`);
      console.log("\n🤖 Bot Response:");
      console.log(`@aibff: ${message.slice(0, 240)}`);
      console.log(`Transaction: ${explorerUrl}`);

      // Check for achievements
      const achievement = await this.checkAchievements(sender);
      if (achievement) {
        console.log("\n🎉 Achievement Tweet:");
        console.log(
          `@aibff: Achievement Unlocked: ${achievement.name}!\nYour empowerment score increased by ${achievement.points} points!`
        );
      }

      console.log("--------------------------------");

      return tx;
    } catch (error) {
      console.error("\n❌ Error Response Tweet:");
      console.error("@aibff: 💔 Oops! Something went wrong. Please try again!");
      throw error;
    }
  }

  async handleTweet(tweetId: string, tweetText: string, sender: string) {
    // Use test mode for testing
    if (process.env.NODE_ENV === "test" || process.env.TEST_MODE === "true") {
      return this.handleTweetInTestMode(tweetId, tweetText, sender);
    }

    const command = this.parseCommand(tweetText);
    if (!command) return;

    try {
      // Validate transaction first
      await this.validateTransaction(command);

      // Generate message
      const message = await this.generateMessage(command);

      // Execute transfer
      const tx = await this.executeTransfer(command);

      // Create tweet with transaction details
      const explorerUrl = `https://sepolia.basescan.org/tx/${tx.hash}`;
      const tweetText = `${message.slice(
        0,
        240
      )}\n\nTransaction: ${explorerUrl}`;

      // Check for achievements
      const achievement = await this.checkAchievements(sender);

      // Reply to tweet
      await this.twitter.v2.tweet(tweetText, {
        reply: {
          in_reply_to_tweet_id: tweetId,
        },
      });

      if (achievement) {
        await this.twitter.v2.tweet(
          `🎉 Achievement Unlocked: ${achievement.name}!\nYour empowerment score increased by ${achievement.points} points!`,
          {
            reply: {
              in_reply_to_tweet_id: tweetId,
            },
          }
        );
      }

      await this.trackTweet();
    } catch (error) {
      console.error("Error handling tweet:", error);

      try {
        await this.twitter.v2.tweet(
          "💔 Oops! Something went wrong. Please try again!",
          {
            reply: {
              in_reply_to_tweet_id: tweetId,
            },
          }
        );
      } catch (replyError) {
        console.error("Error sending error reply:", replyError);
      }
    }
  }

  private async checkAchievements(sender: string): Promise<Achievement | null> {
    // Skip achievement check in test mode
    if (process.env.TEST_MODE === "true") {
      return {
        name: "Test Achievement! 🎯",
        points: 100,
      };
    }

    // Basic achievement check
    try {
      const txCount = await this.contract.provider.getTransactionCount(sender);

      if (txCount === 1) {
        return {
          name: "First Gift! 🎁",
          points: 100,
        };
      }

      return null;
    } catch (error) {
      console.error("Error checking achievements:", error);
      return null;
    }
  }

  private async generateMessage(command: Command): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are AIBFF (AI Best Friend Forever)—a witty, supportive companion who uses memes, Gen-Z slang, and playful tough love to onboard users into crypto.
                   Celebrate their wins, explain transactions in simple terms, and roast excuses (gently). Never flirt.
                   Keep responses short (max 120 chars). Add 2-3 fun emojis but NO hashtags.
                   Example: "Roses are red, ETH is blue, let's grow that portfolio 💅"
                   Current action: Sending ${command.amount} ${command.token} to ${command.recipient}`,
        },
        {
          role: "user",
          content: "Generate a fun, Gen-Z style message about this transfer",
        },
      ],
    });

    return completion.choices[0].message.content || "";
  }

  private async executeTransfer(command: Command) {
    try {
      const amount = ethers.utils.parseEther(command.amount);
      console.log(
        `Executing transfer: ${command.amount} ${command.token} to ${command.recipient}`
      );

      if (command.token === "eth") {
        // Add gas estimation
        const gasLimit = await this.contract.estimateGas.sendEthGift(
          command.recipient,
          {
            value: amount,
          }
        );

        const tx = await this.contract.sendEthGift(command.recipient, {
          value: amount,
          gasLimit: gasLimit.mul(120).div(100), // Add 20% buffer
        });

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`Transaction confirmed: ${receipt.transactionHash}`);

        return {
          hash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          from: receipt.from,
          to: command.recipient,
          amount: command.amount,
          token: command.token,
        };
      } else {
        // USDC transfer
        const tx = await this.contract.sendUsdcGift(
          command.recipient,
          ethers.utils.parseUnits(command.amount, 6),
          { gasLimit: 150000 }
        );

        const receipt = await tx.wait();
        return {
          hash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          from: receipt.from,
          to: command.recipient,
          amount: command.amount,
          token: command.token,
        };
      }
    } catch (error: unknown) {
      console.error("Transaction failed:", error);
      if (error instanceof Error) {
        throw new Error(`Transaction failed: ${error.message}`);
      } else {
        throw new Error("Transaction failed: Unknown error");
      }
    }
  }

  private async validateTransaction(command: Command) {
    try {
      // Check if recipient is valid
      if (
        !ethers.utils.isAddress(command.recipient) &&
        !command.recipient.endsWith(".eth")
      ) {
        throw new Error("Invalid recipient address");
      }

      // Check amount is valid
      const amount = parseFloat(command.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount");
      }

      // Check balance if ETH
      if (command.token === "eth") {
        const balance = await this.contract.provider.getBalance(
          this.contract.address
        );
        const requiredAmount = ethers.utils.parseEther(command.amount);
        if (balance.lt(requiredAmount)) {
          throw new Error("Insufficient ETH balance");
        }
      }

      // Check USDC balance if USDC
      if (command.token === "usdc") {
        const usdcContract = new ethers.Contract(
          USDC_ADDRESS,
          USDC_ABI,
          this.contract.provider
        );
        const balance = await usdcContract.balanceOf(this.contract.address);
        const requiredAmount = ethers.utils.parseUnits(command.amount, 6);
        if (balance.lt(requiredAmount)) {
          throw new Error("Insufficient USDC balance");
        }
      }

      return true;
    } catch (error) {
      console.error("Transaction validation failed:", error);
      throw error;
    }
  }

  private async trackTweet() {
    this.tweetCount++;
    if (this.tweetCount >= 15) {
      // Leave buffer of 2 tweets
      console.log(`Warning: Used ${this.tweetCount}/17 daily tweets`);
    }
  }
}
