const { ethers } = require("ethers");
require("dotenv").config();

const VALENTINE_GIFTS_ADDRESS = "0x3EE70cFc42108714AA6aC6BA4f9b38c22D19744c";

async function checkBalance() {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://sepolia.base.org"
  );

  // Get contract balance
  const balance = await provider.getBalance(VALENTINE_GIFTS_ADDRESS);
  console.log("Contract Balance:", ethers.utils.formatEther(balance), "ETH");

  // Get bot wallet balance
  const wallet = new ethers.Wallet(process.env.BOT_PRIVATE_KEY, provider);
  const botBalance = await wallet.getBalance();
  console.log(
    "Bot Wallet Balance:",
    ethers.utils.formatEther(botBalance),
    "ETH"
  );
}

checkBalance().catch(console.error);
