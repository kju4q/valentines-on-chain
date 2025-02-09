import { TwitterApi } from "twitter-api-v2";
import { CommandParser } from "../ai/CommandParser";
import { TransactionService } from "../transactions/TransactionService";
import { ethers } from "ethers";
import OpenAI from "openai";

export class TwitterHandler {
  private twitter: TwitterApi;
  private appOnlyClient?: TwitterApi;
  private commandParser: CommandParser;
  private transactionService?: TransactionService;
  private openai: OpenAI;
  private testMode: boolean;

  constructor(
    twitterApiKey: string,
    twitterApiSecret: string,
    twitterAccessToken: string,
    twitterAccessSecret: string,
    testMode = false
  ) {
    this.testMode = testMode;

    // OAuth 1.0a client for tweeting
    this.twitter = new TwitterApi({
      appKey: twitterApiKey,
      appSecret: twitterApiSecret,
      accessToken: twitterAccessToken,
      accessSecret: twitterAccessSecret,
    });

    this.commandParser = new CommandParser();
    this.openai = new OpenAI({
      apiKey: process.env.VITE_OPENAI_API_KEY,
    });
  }

  initTransactionService(signer: ethers.Signer) {
    this.transactionService = new TransactionService(signer, "");
  }

  // Initialize app-only client
  async initAppClient(
    apiKey: string,
    apiSecret: string,
    clientId: string,
    clientSecret: string
  ): Promise<void> {
    try {
      // Create app-only client with API key and secret
      const client = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
      });

      // Get app-only client
      this.appOnlyClient = await client.appLogin();

      console.log("✅ App-only client initialized");
    } catch (error) {
      console.error("❌ Failed to initialize app-only client:", error);
      throw error;
    }
  }

  private async generateValentineMessage(
    amount: string,
    recipient: string
  ): Promise<string> {
    try {
      const prompt = `Generate a short, fun Valentine's crypto message about sending ${amount} ETH to ${recipient} on Base blockchain.
The message should:
- Be 3 lines max
- Include emojis
- Mention Base
- Have a playful web3/crypto vibe
- Include "just vibes" somewhere
- Be romantic but modern

Example format:
🌹 Based Valentine's moment
💝 0.1 ETH sent with love to 0xabc...
just vibes on Base`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      });

      return completion.choices[0].message.content || "";
    } catch (error) {
      console.error("AI generation failed:", error);
      return `
🌹 Based Valentine's moment
💝 ${amount} ETH sent with love to ${recipient}...
just vibes on Base`;
    }
  }

  private async postTweetWithRetry(
    message: string,
    maxRetries = 3
  ): Promise<void> {
    if (this.testMode) {
      console.log("🧪 Test mode: Would tweet:", message);
      return;
    }
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.twitter.v2.tweet(message);
        console.log("✅ Reply tweet sent:", message);
        return;
      } catch (error: any) {
        if (error?.code === 429) {
          // Rate limit error
          const resetTime = error?.rateLimit?.reset;
          if (resetTime) {
            const waitTime = (resetTime - Math.floor(Date.now() / 1000)) * 1000;
            console.log(
              `⏳ Rate limited, waiting ${Math.ceil(waitTime / 1000)}s...`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, waitTime + 1000)
            );
            continue;
          }
        }
        throw error;
      }
    }
    throw new Error(`Failed to post tweet after ${maxRetries} retries`);
  }

  async handleTweet(tweet: string) {
    console.log("\n🔍 Parsing tweet:", tweet);
    const command = await this.commandParser.parseCommand(tweet);

    if (!command) {
      console.log("❌ No valid command found in tweet");
      return;
    }

    if (!this.transactionService) {
      console.error("❌ Transaction service not initialized");
      return;
    }

    console.log("💰 Processing transaction:", command);
    let replyMessage: string = ""; // Initialize with empty string

    try {
      const tx = await this.transactionService.sendToken(
        command.recipient,
        command.amount,
        command.token
      );
      console.log("✅ Transaction sent:", tx.hash);

      await this.transactionService.waitForTransaction(tx);

      replyMessage = await this.generateValentineMessage(
        command.amount.toString(),
        command.recipient.slice(0, 6)
      );

      // Try to post tweet with retry logic
      await this.postTweetWithRetry(replyMessage);
    } catch (error) {
      if ((error as any)?.code === 429 && replyMessage) {
        // Check if replyMessage exists and is not empty
        console.log("⚠️ Tweet rate limited, but transaction was successful!");
        console.log("💝 Generated message:", replyMessage);
      } else {
        console.error("❌ Error:", error);
      }
    }
  }

  async pollTweets(): Promise<void> {
    if (!this.appOnlyClient) {
      throw new Error("App-only client not initialized");
    }

    console.log("🔍 Starting to poll for tweets...");

    let lastCheckedId: string | undefined;

    // Poll every 60 seconds
    setInterval(async () => {
      try {
        // Use mentions timeline instead of search
        const tweets = await this.twitter.v2.userMentionTimeline(
          "1887217973372530688", // Your bot's user ID
          {
            since_id: lastCheckedId,
            "tweet.fields": ["author_id", "created_at", "id"],
            max_results: 5,
          }
        );

        if (tweets.data && Array.isArray(tweets.data)) {
          // Update last checked ID
          if (tweets.data.length > 0) {
            lastCheckedId = tweets.data[0].id;
          }

          for (const tweet of tweets.data) {
            if (tweet && tweet.text) {
              console.log("\n📥 Found tweet:", tweet.text);
              await this.handleTweet(tweet.text);
            }
          }
        }
      } catch (error: any) {
        if (error?.code === 429) {
          const resetTime = error?.rateLimit?.reset;
          if (resetTime) {
            const waitTime = (resetTime - Math.floor(Date.now() / 1000)) * 1000;
            console.log(
              `⏳ Rate limited, waiting ${Math.ceil(
                waitTime / 1000
              )}s before next poll...`
            );
            return;
          }
        }
        console.error("❌ Poll error:", error);
      }
    }, 60000);

    console.log("🤖 Bot is running! Press Ctrl+C to stop.");
  }

  public async searchAndProcessTweets(): Promise<void> {
    try {
      const tweets = await this.twitter.v2.search("@0xaibff", {
        "tweet.fields": ["author_id", "conversation_id", "created_at", "id"],
        max_results: 10,
      });

      if (tweets.data && Array.isArray(tweets.data)) {
        for (const tweet of tweets.data) {
          if (tweet && tweet.text) {
            console.log("\n📥 Found tweet:", tweet.text);
            await this.handleTweet(tweet.text);
          }
        }
      }
    } catch (error) {
      console.error("❌ Error checking tweets:", error);
    }
  }
}
