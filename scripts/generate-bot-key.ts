import { ethers } from "ethers";
import * as fs from "fs";

// Generate new wallet
const wallet = ethers.Wallet.createRandom();

console.log("🤖 Bot Wallet Generated:");
console.log("Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);

// Append to .env (but don't overwrite)
fs.appendFileSync(".env", `\nBOT_PRIVATE_KEY=${wallet.privateKey}\n`);

console.log("\n✅ Private key has been added to .env");
console.log("⚠️  Important: Fund this address with some ETH for gas fees!");
