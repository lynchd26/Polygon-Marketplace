const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PolygonMarketplace", function () {
  it("Creates & Complete sales, fetches listings & sales data", async function () {
    const Market = await ethers.getContractFactory("PolygonMarketplace")
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address

    const Item = await ethers.getContractFactory("Item")
    const item = await Item.deploy(marketAddress)
    await item.deployed()
    const itemContractAddress = item.address

    let listingPrice = await market.getListingPrice()
    listingPrice = listingPrice.toString()

    const auctionPrice = ethers.utils.parseUnits('100', 'ether')

    await item.createToken("https://www.mytokenlocation.com")
    await item.createToken("https://www.mytokenlocation2.com")

    await market.createMarketItem(itemContractAddress, 1, auctionPrice, {value: listingPrice})
    await market.createMarketItem(itemContractAddress, 2, auctionPrice, {value: listingPrice})

    const [_, buyerAddress] = await ethers.getSigners()

    await market.connect(buyerAddress).createMarketSale(itemContractAddress, 1, { value: auctionPrice})
  
    let items = await market.fetchMarketItems()

    items = await Promise.all(items.map(async i => {
      const tokenUri = await item.tokenURI(i.tokenId)
      let formatItem = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return formatItem
  }))

  console.log('items: ', items)

  });
});
