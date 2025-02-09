import { OpenAI } from "openai";

export interface GiftSuggestion {
  message: string; // Romantic message
  amount: string; // Suggested amount
  type: "eth"; // Keep it simple, start with ETH only
  emoji: string; // A fitting emoji
}

export class GiftAdvisor {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
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

    return JSON.parse(completion.choices[0].message.content);
  }
}
