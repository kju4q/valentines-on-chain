export const MockValentineGifts = {
  provider: {
    getTransactionCount: async (_address: string) => {
      // Mock transaction count for testing
      return Promise.resolve(1);
    },
  },

  sendEthGift: async (recipient: string, options: { value: string }) => {
    console.log(`Mock: Sending ${options.value} ETH to ${recipient}`);
    return {
      hash: "0x123...mock_tx_hash",
      wait: async () => ({ status: 1 }),
    };
  },

  sendUsdcGift: async (recipient: string, amount: string) => {
    console.log(`Mock: Sending ${amount} USDC to ${recipient}`);
    return {
      hash: "0x123...mock_tx_hash",
      wait: async () => ({ status: 1 }),
    };
  },
};
