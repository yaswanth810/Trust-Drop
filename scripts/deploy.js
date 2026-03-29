const hre = require("hardhat");

async function main() {
  console.log("Deploying TrustDrop contract...");

  const TrustDrop = await hre.ethers.getContractFactory("TrustDrop");
  const trustDrop = await TrustDrop.deploy();

  await trustDrop.waitForDeployment();

  const address = await trustDrop.getAddress();
  console.log(`TrustDrop deployed to: ${address}`);
  console.log(`Update your .env file with: VITE_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
