interface SendCommand {
  type: "send";
  recipient: string;
  amount: number;
  token: "ETH" | "USDC";
}

export class CommandParser {
  async parseCommand(text: string): Promise<SendCommand | null> {
    // Match your exact tweet format
    const sendMatch = text.match(
      /hey @0xaibff,?\s+send\s+([a-zA-Z0-9\.]+(?:\.eth)?|0x[a-fA-F0-9]+)\s+(\d*\.?\d*)\s*ETH/i
    );

    if (sendMatch) {
      const [_, recipient, amount] = sendMatch;
      return {
        type: "send",
        recipient: recipient.toLowerCase(),
        amount: parseFloat(amount),
        token: "ETH",
      };
    }

    console.log("❌ No command match found for:", text);
    return null;
  }
}
