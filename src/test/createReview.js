const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PolygonMarketplace", function () {
  it("Creates Review", async function () {
    const Market = await ethers.getContractFactory("PolygonMarketplace")
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address

    const Item = await ethers.getContractFactory("Item")
    const item = await Item.deploy(marketAddress)
    await item.deployed()
    const itemContractAddress = item.address

    let listingPrice = await market.getReviewListingPrice()
    listingPrice = listingPrice.toString()

    const auctionPrice = ethers.utils.parseUnits('0', 'ether')

    await item.createToken("https://www.mytokenlocation.com")

    await market.createReview(itemContractAddress, 1, auctionPrice, {value: listingPrice})

    let items = await market.fetchMarketItems()

    items = await Promise.all(items.map(async i => {
      const tokenUri = await item.tokenURI(i.tokenId)
      let formatItem = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        review: i.review,
        tokenUri
      }
      return formatItem
  }))

  console.log('items: ', items)

  });
});
