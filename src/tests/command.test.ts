import { CommandParser } from "../services/ai/CommandParser";
import { TransactionService } from "../services/transactions/TransactionService";
import { ethers } from "ethers";

async function testCommandWorkflow() {
  console.log("\n🧪 Testing Command Workflow");

  // Test cases
  const testCases = [
    "send vitalik.eth 1 eth",
    "send 0x742d35Cc6634C0532925a3b844Bc454e4438f44e 0.1 eth",
    "hey aibff send albicodes 10 usdc",
    "send nick.eth 5.5 usdc",
  ];

  const commandParser = new CommandParser();

  console.log("\n1. Testing Command Parsing:");
  for (const test of testCases) {
    try {
      console.log(`\n🔍 Testing command: "${test}"`);
      const result = await commandParser.parseCommand(test);
      console.log("✅ Parsed result:", result);
    } catch (error) {
      console.error("❌ Parse failed:", error);
    }
  }

  // Test transaction flow with mock signer
  console.log("\n2. Testing Transaction Flow:");
  try {
    // Create a mock provider and signer for testing
    const provider = new ethers.providers.JsonRpcProvider(
      "https://base-sepolia-rpc.publicnode.com"
    );
    const mockSigner = new ethers.Wallet(
      "YOUR_PRIVATE_KEY", // Add a test wallet private key
      provider
    );

    const transactionService = new TransactionService(
      mockSigner,
      "YOUR_USDC_CONTRACT_ADDRESS" // Add Base Sepolia USDC address
    );

    // Test with a small amount
    const testAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    console.log("\n🔍 Testing ETH transfer:");
    const ethTx = await transactionService.sendToken(testAddress, 0.001, "ETH");
    console.log("✅ ETH transaction:", ethTx.hash);

    console.log("\n🔍 Testing USDC transfer:");
    const usdcTx = await transactionService.sendToken(testAddress, 1, "USDC");
    console.log("✅ USDC transaction:", usdcTx.hash);
  } catch (error) {
    console.error("❌ Transaction test failed:", error);
  }
}

// Run tests
testCommandWorkflow()
  .then(() => console.log("\n🎉 All tests completed"))
  .catch(console.error);
