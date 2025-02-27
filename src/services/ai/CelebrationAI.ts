import {
  detectCelebration as apiDetectCelebration,
  generatePersonalizedCelebration as apiGeneratePersonalizedCelebration,
  suggestGiftMessage as apiSuggestGiftMessage,
} from "../api/celebrationApi";
import { AIGeneratedCelebration } from "./types";

export interface AIGeneratedCelebration {
  id: string;
  name: string;
  description: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    emoji: string;
  };
  suggestedMessages: string[];
  giftIdeas: {
    description: string;
    suggestedAmount: string;
  }[];
}

export class CelebrationAI {
  async detectCelebration(date: Date): Promise<AIGeneratedCelebration> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return mock data based on the current month
    const month = date.getMonth();

    if (month === 11 || month === 0) {
      // December or January
      return {
        id: "winter-holidays",
        name: "Winter Holidays",
        description: "Celebrate the joy and warmth of the winter season",
        theme: {
          primaryColor: "blue",
          secondaryColor: "white",
          backgroundColor: "blue-50",
          emoji: "❄️",
        },
        suggestedMessages: [
          "Wishing you warmth and joy this winter season!",
          "May your holidays be filled with love and laughter!",
          "Sending you cozy winter wishes!",
        ],
        giftIdeas: [
          {
            description: "A small holiday token",
            suggestedAmount: "0.01",
          },
          {
            description: "A generous winter gift",
            suggestedAmount: "0.05",
          },
          {
            description: "A special holiday celebration",
            suggestedAmount: "0.1",
          },
        ],
      };
    }

    // Default for other months
    return {
      id: "celebration",
      name: "Celebration",
      description: "Send a gift to celebrate a special occasion",
      theme: {
        primaryColor: "amber",
        secondaryColor: "yellow",
        backgroundColor: "amber-50",
        emoji: "🎁",
      },
      suggestedMessages: [
        "Sending you this gift to celebrate!",
        "A token of appreciation for you!",
        "Enjoy this gift on your special day!",
      ],
      giftIdeas: [
        {
          description: "A small token of appreciation",
          suggestedAmount: "0.01",
        },
        {
          description: "A meaningful gift to celebrate",
          suggestedAmount: "0.05",
        },
        {
          description: "A generous gift for a special occasion",
          suggestedAmount: "0.1",
        },
      ],
    };
  }

  async generatePersonalizedCelebration(
    occasion: string,
    relationship?: string
  ): Promise<AIGeneratedCelebration> {
    return apiGeneratePersonalizedCelebration(occasion, relationship);
  }

  async suggestGiftMessage(
    occasion: string,
    relationship?: string,
    amount?: string
  ): Promise<string> {
    return apiSuggestGiftMessage(occasion, relationship, amount);
  }
}
