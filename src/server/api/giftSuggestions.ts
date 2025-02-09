import { OpenAI } from "openai";
import { Router, Request, Response } from "express";

interface SuggestionRequest {
  prompt: string;
}

const router = Router();

const handleSuggestion = async (
  req: Request<{}, any, SuggestionRequest>,
  res: Response
): Promise<void> => {
  if (!process.env.VITE_OPENAI_API_KEY) {
    res.status(500).json({ error: "OpenAI API key not configured" });
    return;
  }

  const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Valentine's gift advisor. Give ONE unique crypto gift idea.
                    Format: "<amount> ETH - <message about recipient's growth> <2 emojis>"
                    Use different amounts between 0.005 and 0.05 ETH.
                    Focus on recipient's: learning, growth, independence.
                    
                    Examples:
                    "0.008 ETH - Launch their DeFi journey! 🚀💫"
                    "0.015 ETH - Support their crypto dreams! ✨💎"
                    "0.025 ETH - Empower their Web3 start! 🌱⚡"
                    "0.012 ETH - Boost their crypto learning! 📚💫"
                    "0.035 ETH - Fund their NFT creation! 🎨✨"`,
        },
        {
          role: "user",
          content: "new gift suggestion",
        },
      ],
      max_tokens: 12,
      temperature: 0.9,
      presence_penalty: 1.0,
      frequency_penalty: 2.0,
      stop: ["\n", ".", "1.", "*"],
    });

    let suggestion = completion.choices[0].message.content?.trim();

    const fallbacks = [
      "0.008 ETH - Launch their DeFi journey! 🚀💫",
      "0.015 ETH - Support their crypto dreams! ✨💎",
      "0.025 ETH - Empower their Web3 start! 🌱⚡",
      "0.012 ETH - Boost their crypto learning! 📚💫",
      "0.035 ETH - Fund their NFT creation! 🎨✨",
    ];

    if (!suggestion?.includes("ETH -") || suggestion.length > 35) {
      suggestion = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    res.json({ suggestion });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: "Failed to get suggestion" });
  }
};

router.post("/suggest", handleSuggestion);

export default router;
