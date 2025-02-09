import { MockTwitterAPI } from "../services/twitter/MockTwitterAPI";

async function testTwitterScenarios() {
  const twitter = new MockTwitterAPI();

  try {
    console.log("\n🧪 Testing First Gift NFT Tweet:");
    const firstGiftTweet = await twitter.tweet(`
🌹 First Valentine Gift from 0xHopelessRomantic!
💝 0.1 ETH sent with love
#ValentinesOnChain #BaseChain
    `);
    console.log("✅ First gift tweet sent:", firstGiftTweet.id);

    console.log("\n🧪 Testing NFT Mint Tweet with Image:");
    const nftTweet = await twitter.tweetWithMedia(
      `💘 New Valentine NFT Minted!
🎨 A unique love token on Base
#ValentinesOnChain #NFT`,
      "mock-nft-image-url"
    );
    console.log("✅ NFT mint tweet sent:", nftTweet.id);

    console.log("\n🧪 Testing Rate Limit:");
    for (let i = 0; i < 13; i++) {
      await twitter.tweet(`Test tweet ${i + 1}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Rate limit exceeded") {
      console.log("✅ Rate limit handling works as expected");
    } else {
      console.error("❌ Test failed:", error);
    }
  }
}

// Run tests
testTwitterScenarios()
  .then(() => {
    console.log("\n🎉 All test scenarios completed");
  })
  .catch(console.error);
