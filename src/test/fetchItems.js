const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PolygonMarketplace", function () {
  it("Fetches listings", async function () {
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

  
    let myItems = await market.fetchMyItems()

    myItems = await Promise.all(myItems.map(async i => {
      const tokenUri = await item.tokenURI(i.tokenId)
      let formatMyItem = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return formatMyItem
  }))

  console.log('my items: ', myItems)


  let createdItems = await market.fetchItemsCreated()

  createdItems = await Promise.all(createdItems.map(async i => {
    const tokenUri = await item.tokenURI(i.tokenId)
    let formatCreatedItem = {
      price: i.price.toString(),
      tokenId: i.tokenId.toString(),
      seller: i.seller,
      owner: i.owner,
      tokenUri
    }
    return formatCreatedItem
}))

console.log('my items: ', createdItems)

  });
});
