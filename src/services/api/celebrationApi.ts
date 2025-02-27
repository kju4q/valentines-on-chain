// This file handles API calls to your backend

export const detectCelebration = async (date: Date) => {
  const response = await fetch("/api/detect-celebration", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date: date.toISOString() }),
  });

  if (!response.ok) {
    throw new Error("Failed to detect celebration");
  }

  return response.json();
};

export const generatePersonalizedCelebration = async (
  occasion: string,
  relationship?: string
) => {
  const response = await fetch("/api/generate-celebration", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ occasion, relationship }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate celebration");
  }

  return response.json();
};

export const suggestGiftMessage = async (
  occasion: string,
  relationship?: string,
  amount?: string
) => {
  const response = await fetch("/api/suggest-message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ occasion, relationship, amount }),
  });

  if (!response.ok) {
    throw new Error("Failed to suggest message");
  }

  const data = await response.json();
  return data.message;
};
