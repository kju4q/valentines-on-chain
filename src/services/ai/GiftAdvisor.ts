import OpenAI from "openai";

export interface GiftSuggestion {
  message: string; // Romantic message
  amount: string; // Suggested amount
  type: "eth"; // Keep it simple, start with ETH only
  emoji: string; // A fitting emoji
}

interface GiftParams {
  amount: number;
  token: string;
  recipient: string;
}

export class GiftAdvisor {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.VITE_OPENAI_API_KEY!,
    });
  }

  async generateMessage(params: GiftParams): Promise<string> {
    try {
      const prompt = `Create a romantic crypto-themed Valentine's message about sending ${params.amount} ${params.token} to ${params.recipient}. Include:
        - A crypto/finance-themed love pun
        - 2-3 relevant emojis
        - Keep it under 100 characters
        - Make it playful and fun`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      });

      return (
        response.choices[0].message.content ||
        `💝 Sending ${params.amount} ${params.token} with love to ${params.recipient}!`
      );
    } catch (error) {
      console.error("Error generating message:", error);
      return `💝 Sending ${params.amount} ${params.token} with love to ${params.recipient}!`;
    }
  }

  async suggestGift(prompt: string): Promise<GiftSuggestion> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are Cupid's AI assistant. Help create romantic crypto gifts.
                   Return only JSON with format:
                   {
                     "message": "romantic message",
                     "amount": "0.01", // in ETH
                     "type": "eth",
                     "emoji": "💝"
                   }`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      // Return default suggestion if no content
      return {
        message: "Let me send you some crypto love! 💝",
        amount: "0.01",
        type: "eth",
        emoji: "💝",
      };
    }

    return JSON.parse(content);
  }
}
