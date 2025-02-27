import { useState } from "react";
import { useAICelebration } from "../contexts/AICelebrationContext";

export const AICelebrationSelector = () => {
  const {
    currentCelebration,
    isLoading,
    detectCelebration,
    setCustomCelebration,
  } = useAICelebration();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customOccasion, setCustomOccasion] = useState("");
  const [relationship, setRelationship] = useState("");

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customOccasion) {
      await setCustomCelebration(customOccasion, relationship || undefined);
      setShowCustomForm(false);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-amber-100 mb-6">
      <h2 className="text-lg font-semibold text-amber-700 mb-4">
        {isLoading
          ? "Detecting Celebration..."
          : `Current Celebration: ${currentCelebration.name}`}
      </h2>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl">{currentCelebration.theme.emoji}</span>
        <div>
          <p className="text-amber-800">{currentCelebration.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {currentCelebration.suggestedMessages.map((msg, i) => (
          <div
            key={i}
            className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm border border-amber-200"
          >
            {msg}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => detectCelebration()}
          disabled={isLoading}
          className="px-4 py-2 bg-yellow-50 text-amber-700 border border-amber-200 rounded-full hover:bg-yellow-100 hover:border-amber-300 transition-all disabled:opacity-50"
        >
          {isLoading ? "Detecting..." : "Detect Celebration"}
        </button>

        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="px-4 py-2 border border-amber-200 text-amber-700 rounded-full hover:bg-amber-50 transition-colors"
        >
          {showCustomForm ? "Cancel" : "Custom Celebration"}
        </button>
      </div>

      {showCustomForm && (
        <form onSubmit={handleCustomSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-700 mb-1">
              What are you celebrating?
            </label>
            <input
              type="text"
              value={customOccasion}
              onChange={(e) => setCustomOccasion(e.target.value)}
              placeholder="Birthday, Anniversary, Graduation..."
              className="w-full px-4 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-700 mb-1">
              Relationship (optional)
            </label>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="Friends, Family, Colleagues..."
              className="w-full px-4 py-2 rounded-lg border border-amber-200 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-yellow-50 text-amber-700 border border-amber-200 rounded-full hover:bg-yellow-100 hover:border-amber-300 transition-all"
          >
            Generate Custom Celebration
          </button>
        </form>
      )}
    </div>
  );
};
