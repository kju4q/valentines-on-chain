interface DeeplinkParams {
  amount: string;
  token: string;
  recipient: string;
  message: string;
}

export function generateDeeplink({
  amount,
  token,
  recipient,
  message,
}: DeeplinkParams): string {
  // Use localhost:5173 for development
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://valentines.finance"
      : "http://localhost:5173";

  const params = new URLSearchParams({
    amount,
    token: token.toLowerCase(),
    to: recipient,
    message,
  });

  return `${baseUrl}/send?${params.toString()}`;
}
