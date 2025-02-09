import { useState } from "react";

interface AIGiftCreatorProps {
  onGiftSelect: (suggestion: any) => void;
  onSuggestion: () => void;
  onStateChange?: (loading: boolean, suggestion: string) => void;
}

export const AIGiftCreator = ({
  onGiftSelect,
  onSuggestion,
  onStateChange,
}: AIGiftCreatorProps) => {
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetSuggestion = async () => {
    setLoading(true);
    onStateChange?.(true, "");
    try {
      const response = await fetch("http://localhost:3001/api/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "Suggest a Valentine's Day crypto gift",
        }),
      });

      const data = await response.json();
      setSuggestion(data.suggestion);
      onStateChange?.(false, data.suggestion);
    } catch (error) {
      console.error("Error getting suggestion:", error);
      onStateChange?.(false, "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`p-4 backdrop-blur-sm rounded-2xl transition-all duration-300 ${
        loading ? "bg-pink-100/50" : "bg-white/30"
      }`}
    >
      {!suggestion ? (
        <>
          <button
            onClick={handleGetSuggestion}
            className={`w-full px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
              loading
                ? "bg-pink-200 cursor-not-allowed"
                : "bg-pink-500 hover:bg-pink-600"
            } text-white`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <span className="animate-spin mr-2">🌸</span>
                Thinking...
              </div>
            ) : (
              "Get Gift Suggestion"
            )}
          </button>
        </>
      ) : (
        <div className="p-4 bg-white/50 rounded-xl text-center">
          <p className="text-pink-700 text-lg font-medium inline-flex flex-col items-center gap-2">
            <span className="text-2xl">💝</span>
            {suggestion}
          </p>
          <button
            onClick={() => {
              setSuggestion("");
            }}
            className="mt-4 text-sm text-pink-500 hover:text-pink-600 transition-colors"
          >
            Get Another Suggestion
          </button>
        </div>
      )}
    </div>
  );
};
