const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Base Sepolia USDC address - fixed checksum
  const USDC_ADDRESS = "0x036CBD53842c5426634e7929541ec2318F3DCF7C";
  const SHEFI_TREASURY = deployer.address; // Using deployer as treasury for testing

  const ValentineGifts = await ethers.getContractFactory("ValentineGifts");
  const valentineGifts = await ValentineGifts.deploy(
    USDC_ADDRESS,
    SHEFI_TREASURY
  );

  await valentineGifts.deployed();

  console.log("USDC Address:", USDC_ADDRESS);
  console.log("SheFi Treasury:", SHEFI_TREASURY);
  console.log("ValentineGifts deployed to:", valentineGifts.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
