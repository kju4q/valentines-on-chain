# Valentines on Chain 💝

A Twitter bot that sends Valentine's ETH gifts on Base blockchain with romantic AI-generated messages.

## Features

- 🎁 Send ETH gifts via tweets
- 🤖 AI-generated Valentine's messages
- ⛓️ Base blockchain integration
- 💌 Automatic tweet replies

## Quick Demo Setup

1. Clone and install:

```bash
git clone https://github.com/yourusername/valentines-on-chain
cd valentines-on-chain
npm install
```

2. Use test environment (included for demo):

```bash
cp .env.test .env
```

> Note: The .env.test file includes safe demo keys that:
>
> - Don't have access to real funds
> - Are for testing purposes only
> - Show full functionality without real transactions

3. Run the test suite:

```bash
npm run test:valentine
```

## Test Cases

The test suite demonstrates:

1. Command parsing:

   ```
   hey @0xaibff, send 0x0faA...1234 0.0001 ETH
   ```

2. Transaction processing on Base Sepolia
3. AI-generated Valentine's messages
4. Rate limit handling
5. Error cases

## Expected Output

```
🚀 Starting Valentine's Bot Tests

🧪 Testing Valentine's Bot
🔑 Using test wallet: 0x1234...5678
🌍 Network: base-sepolia

📝 Testing tweet: "hey @0xaibff, send 0x0faA... 0.0001 ETH"
✅ Transaction sent: 0xabc...
💝 Generated message: "Based Valentine's vibes..."

✅ All tests completed
```

## Technical Details

- Base Sepolia testnet
- OpenAI GPT-3.5 for message generation
- Twitter API v2 integration
- Ethers.js for blockchain interaction

## Local Testing

All tests run in test mode without requiring:

- Real ETH
- Twitter API keys
- OpenAI API keys

## Notes

- Test transactions use mock values
- Messages are generated locally in test mode
- Network calls are simulated

## Setup for Testing

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. For quick testing, use these demo values:

```env
VITE_PRIVY_APP_ID=demo-privy-app-id-123
VITE_NFT_CONTRACT_ADDRESS=0x4cba8bc2efb78f59b991d612b71b00c2803e31ca
# ... (other demo values)
```

> Note: These demo values are for testing only and don't have access to real funds
