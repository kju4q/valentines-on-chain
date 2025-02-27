import { useState } from "react";
import { useAICelebration } from "../contexts/AICelebrationContext";

interface AIGiftCreatorProps {
  onGiftSelect: (suggestion: any) => void;
  onSuggestion: () => void;
}

export const AIGiftCreator = ({
  onGiftSelect,
  onSuggestion,
}: AIGiftCreatorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [prompt, setPrompt] = useState("");
  const [relationship, setRelationship] = useState("");
  const { currentCelebration, suggestGiftMessage } = useAICelebration();

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    try {
      // Use AI-generated gift ideas from the current celebration
      const aiSuggestions = await Promise.all(
        currentCelebration.giftIdeas.map(async (idea) => {
          const message = await suggestGiftMessage(
            relationship || undefined,
            idea.suggestedAmount
          );
          return {
            message,
            amount: idea.suggestedAmount,
            description: idea.description,
          };
        })
      );

      setSuggestions(aiSuggestions);
    } catch (error) {
      console.error("Error getting suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <label
          htmlFor="prompt"
          className="block text-sm font-medium text-amber-700 mb-1"
        >
          What's the occasion? (optional)
        </label>
        <input
          type="text"
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Celebrating ${currentCelebration.name}`}
          className="w-full px-4 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 outline-none"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="relationship"
          className="block text-sm font-medium text-amber-700 mb-1"
        >
          Your relationship with recipient (optional)
        </label>
        <input
          type="text"
          id="relationship"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="Friends, Family, Colleagues..."
          className="w-full px-4 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 outline-none"
        />
      </div>

      <button
        onClick={handleGetSuggestions}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-yellow-50 text-amber-700 border border-amber-200 rounded-full hover:bg-yellow-100 hover:border-amber-300 transition-all disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-amber-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Generating suggestions...
          </span>
        ) : (
          "Get Gift Suggestions"
        )}
      </button>

      {suggestions.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-amber-700">
            Choose a suggestion:
          </h3>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-4 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 hover:border-amber-300 cursor-pointer transition-all"
              onClick={() => onGiftSelect(suggestion)}
            >
              <p className="text-amber-800 mb-2">{suggestion.message}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-amber-600">
                  {suggestion.description}
                </span>
                <span className="font-semibold text-amber-700">
                  {suggestion.amount} ETH
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
