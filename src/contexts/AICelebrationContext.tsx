import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CelebrationAI,
  AIGeneratedCelebration,
} from "../services/ai/CelebrationAI";

// Default celebration as fallback
const defaultCelebration: AIGeneratedCelebration = {
  id: "default-celebration",
  name: "Gift Celebration",
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

interface AICelebrationContextType {
  currentCelebration: AIGeneratedCelebration;
  isLoading: boolean;
  detectCelebration: () => Promise<void>;
  setCustomCelebration: (
    occasion: string,
    relationship?: string
  ) => Promise<void>;
  suggestGiftMessage: (
    relationship?: string,
    amount?: string
  ) => Promise<string>;
}

const AICelebrationContext = createContext<AICelebrationContextType>({
  currentCelebration: defaultCelebration,
  isLoading: false,
  detectCelebration: async () => {},
  setCustomCelebration: async () => {},
  suggestGiftMessage: async () => "",
});

export const useAICelebration = () => useContext(AICelebrationContext);

export const AICelebrationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [celebrationAI] = useState(() => new CelebrationAI());
  const [currentCelebration, setCurrentCelebration] =
    useState<AIGeneratedCelebration>(defaultCelebration);
  const [isLoading, setIsLoading] = useState(false);

  // Detect celebration on initial load
  useEffect(() => {
    detectCelebration();
  }, []);

  const detectCelebration = async () => {
    try {
      setIsLoading(true);
      const detected = await celebrationAI.detectCelebration(new Date());
      setCurrentCelebration(detected);
    } catch (error) {
      console.error("Failed to detect celebration:", error);
      // Fall back to default
      setCurrentCelebration(defaultCelebration);
    } finally {
      setIsLoading(false);
    }
  };

  const setCustomCelebration = async (
    occasion: string,
    relationship?: string
  ) => {
    try {
      setIsLoading(true);
      const custom = await celebrationAI.generatePersonalizedCelebration(
        occasion,
        relationship
      );
      setCurrentCelebration(custom);
    } catch (error) {
      console.error("Failed to generate custom celebration:", error);
      // Keep current celebration
    } finally {
      setIsLoading(false);
    }
  };

  const suggestGiftMessage = async (relationship?: string, amount?: string) => {
    try {
      return await celebrationAI.suggestGiftMessage(
        currentCelebration.name,
        relationship,
        amount
      );
    } catch (error) {
      console.error("Failed to suggest gift message:", error);
      return currentCelebration.suggestedMessages[0];
    }
  };

  return (
    <AICelebrationContext.Provider
      value={{
        currentCelebration,
        isLoading,
        detectCelebration,
        setCustomCelebration,
        suggestGiftMessage,
      }}
    >
      {children}
    </AICelebrationContext.Provider>
  );
};
