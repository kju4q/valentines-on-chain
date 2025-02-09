import { TwitterApi } from "twitter-api-v2";
import { CommandParser } from "../ai/CommandParser";
import { TransactionService } from "../transactions/TransactionService";
import { ethers } from "ethers";
import OpenAI from "openai";

export class MockTwitterAPI {
  private tweetCount = 0;
  private readonly RATE_LIMIT = 15;
  private commandParser: CommandParser;
  private transactionService?: TransactionService;
  private openai: OpenAI;

  constructor() {
    this.commandParser = new CommandParser();
    this.openai = new OpenAI({
      apiKey: process.env.VITE_OPENAI_API_KEY,
    });
  }

  // Add method to initialize transaction service
  initTransactionService(signer: ethers.Signer, usdcAddress: string) {
    this.transactionService = new TransactionService(signer, usdcAddress);
  }

  private getRandomValentineMessage(amount: string, recipient: string): string {
    const messages = [
      `
🌹 Based Valentine's moment
💝 ${amount} ETH sent with a heart full of love to ${recipient}...
just vibes on Base`,
      `
💘 Cupid's arrow strikes again
🎀 ${amount} ETH delivered with affection to ${recipient}...
spreading love on Base`,
      `
💖 Love is in the blockchain
✨ ${amount} ETH wrapped with care for ${recipient}...
just vibes on Base`,
      `
🌸 Another Valentine's wish granted
💫 ${amount} ETH sent with warm thoughts to ${recipient}...
love flows on Base`,
      `
💝 Romance meets web3
🌹 ${amount} ETH gifted with joy to ${recipient}...
just vibes on Base`,
    ];

    return messages[Math.floor(Math.random() * messages.length)];
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

      const message =
        completion.choices[0].message.content ||
        this.getRandomValentineMessage(amount, recipient);
      return message;
    } catch (error) {
      console.error("AI generation failed, using fallback:", error);
      return this.getRandomValentineMessage(amount, recipient);
    }
  }

  async tweet(message: string) {
    this.checkRateLimit();
    this.tweetCount++;

    const command = await this.commandParser.parseCommand(message);
    if (command && this.transactionService) {
      console.log("💰 Processing transaction:", command);
      try {
        const tx = await this.transactionService.sendToken(
          command.recipient,
          command.amount,
          command.token
        );
        console.log("✅ Transaction sent:", tx.hash);

        await this.transactionService.waitForTransaction(tx);

        // Generate AI message with fallback
        const successTweet = await this.generateValentineMessage(
          command.amount.toString(),
          command.recipient.slice(0, 6)
        );

        console.log("✅ Transaction confirmed!");
        message = successTweet;
      } catch (error) {
        console.error("❌ Transaction failed:", error);
      }
    }

    console.log("🐦 Mock Tweet:", message);
    console.log(`Tweets used: ${this.tweetCount}/${this.RATE_LIMIT}`);
    return { id: `mock-tweet-${Date.now()}`, text: message };
  }

  async tweetWithMedia(message: string, imageUrl: string) {
    this.checkRateLimit();
    this.tweetCount++;
    console.log("🐦 Mock Tweet with Media:", { message, imageUrl });
    console.log(`Tweets used: ${this.tweetCount}/${this.RATE_LIMIT}`);
    return { id: `mock-media-tweet-${Date.now()}`, text: message };
  }

  private checkRateLimit() {
    if (this.tweetCount >= this.RATE_LIMIT) {
      throw new Error("Rate limit exceeded");
    }
  }
}
