import { OpenAI } from "openai";
import { TwitterApi } from "twitter-api-v2";
import { ethers } from "ethers";
import {
  VALENTINE_GIFTS_ABI,
  VALENTINE_GIFTS_ADDRESS,
} from "../../contracts/ValentineGifts";
import { MockValentineGifts } from "../../tests/mocks/ValentineGifts.mock";

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

  async handleTweet(tweetId: string, tweetText: string, sender: string) {
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

      // In test mode, just log instead of tweeting
      if (process.env.NODE_ENV === "test") {
        console.log("Would tweet:", message);
        console.log("Transaction:", tx.hash);
        return;
      }

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
          content: `You are AIBFF (AI Best Friend Forever), an empowering friend who helps people learn about crypto and web3. 
                   You're enthusiastic about empowering women in web3.
                   Current action: Sending ${command.amount} ${command.token} to ${command.recipient}`,
        },
        {
          role: "user",
          content: "Generate an empowering message about this transfer",
        },
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate message");
    }
    return content;
  }

  private async executeTransfer(command: Command) {
    try {
      console.log(
        `Executing transfer: ${command.amount} ${command.token} to ${command.recipient}`
      );

      if (command.token === "eth") {
        const tx = await this.contract.sendEthGift(command.recipient, {
          value: ethers.utils.parseEther(command.amount),
          gasLimit: 100000, // Add gas limit
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
    } catch (error) {
      console.error("Transaction failed:", error);
      throw new Error(`Transaction failed: ${error.message}`);
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
}
