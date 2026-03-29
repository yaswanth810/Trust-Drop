const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    console.error("Please set VITE_CONTRACT_ADDRESS in .env first!");
    process.exit(1);
  }

  const TrustDrop = await hre.ethers.getContractFactory("TrustDrop");
  const trustDrop = TrustDrop.attach(contractAddress);

  console.log("Seeding demo campaigns...\n");

  // Campaign 1: Vizag Flood Relief 2025
  const tx1 = await trustDrop.createCampaign(
    "Vizag Flood Relief 2025",
    "Emergency relief fund for families affected by the devastating floods in Visakhapatnam. All funds are transparently tracked and released upon verified milestone completion.",
    [
      "Purchase 500 food kits",
      "Transport to flood zone",
      "Distribute to 200 families"
    ],
    [
      hre.ethers.parseEther("0.05"),
      hre.ethers.parseEther("0.02"),
      hre.ethers.parseEther("0.03")
    ],
    [
      Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      Math.floor(Date.now() / 1000) + 45 * 24 * 60 * 60,
      Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60
    ]
  );
  await tx1.wait();
  console.log("✅ Campaign 1: Vizag Flood Relief 2025 created");

  // Campaign 2: Street Cause — School Supplies Drive
  const tx2 = await trustDrop.createCampaign(
    "Street Cause — School Supplies Drive",
    "Providing essential school supplies to underprivileged children across 3 government schools in rural areas. Every notebook counts.",
    [
      "Buy notebooks and stationery",
      "Deliver to 3 government schools"
    ],
    [
      hre.ethers.parseEther("0.03"),
      hre.ethers.parseEther("0.02")
    ],
    [
      Math.floor(Date.now() / 1000) + 20 * 24 * 60 * 60,
      Math.floor(Date.now() / 1000) + 40 * 24 * 60 * 60
    ]
  );
  await tx2.wait();
  console.log("✅ Campaign 2: Street Cause — School Supplies Drive created");

  // Campaign 3: Medical Camp — Rural Vizag
  const tx3 = await trustDrop.createCampaign(
    "Medical Camp — Rural Vizag",
    "Free medical camp providing healthcare services to underserved rural communities in Vizag district. Includes medicines, check-ups, and follow-up care.",
    [
      "Procure medicines",
      "Set up camp location",
      "Conduct medical camp"
    ],
    [
      hre.ethers.parseEther("0.08"),
      hre.ethers.parseEther("0.02"),
      hre.ethers.parseEther("0.05")
    ],
    [
      Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60,
      Math.floor(Date.now() / 1000) + 25 * 24 * 60 * 60,
      Math.floor(Date.now() / 1000) + 45 * 24 * 60 * 60
    ]
  );
  await tx3.wait();
  console.log("✅ Campaign 3: Medical Camp — Rural Vizag created");

  console.log("\n🎉 All 3 demo campaigns seeded successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
