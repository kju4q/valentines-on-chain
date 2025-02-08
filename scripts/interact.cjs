const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();

  // Contract addresses - updated with new deployment
  const VALENTINE_GIFTS = "0xf76e9Ad188c4eb1Fea69B25CabafB9930EA5DF8E";
  const USDC = "0x036CBD53842c5426634e7929541ec2318F3DCF7C";

  // Get contract instances
  const valentineGifts = await ethers.getContractAt(
    "ValentineGifts",
    VALENTINE_GIFTS
  );
  const usdc = await ethers.getContractAt("IERC20", USDC);

  // Test sending ETH gift
  console.log("Sending ETH gift...");
  const ethTx = await valentineGifts.sendEthGift(signer.address, {
    value: ethers.utils.parseEther("0.01"),
  });
  await ethTx.wait();
  console.log("ETH gift sent!");

  // Test USDC approval and gift
  console.log("Approving USDC...");
  const approveTx = await usdc.approve(
    VALENTINE_GIFTS,
    ethers.utils.parseUnits("100", 6)
  );
  await approveTx.wait();
  console.log("USDC approved!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
