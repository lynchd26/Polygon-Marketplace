const hre = require("hardhat");

async function main() {
  const PolygonMarketplace = await hre.ethers.getContractFactory("PolygonMarketplace");
  const polygonMarketplace = await PolygonMarketplace.deploy();
  await polygonMarketplace.deployed();
  console.log("polygonMarketplace deployed to:", polygonMarketplace.address);

  const Item = await hre.ethers.getContractFactory("Item");
  const item = await Item.deploy(polygonMarketplace.address);
  await item.deployed();
  console.log("item deployed to:", item.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
