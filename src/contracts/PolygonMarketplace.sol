// SPDX-Licence-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// Security control against re-entry attacks
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


import "hardhat/console.sol";

contract PolygonMarketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listPrice = 0.1 ether;
    uint256 reviewListPrice = 0.0 ether;

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint itemId;
        address itemContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        bool review;

    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated (
        uint indexed itemId,
        address indexed itemContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold,
        bool review
    );

    event reviewCreated (
        uint indexed itemId,
        address indexed itemContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold,
        bool review
    );

    function getListingPrice() public view returns (uint256) {
        return listPrice;
    }

    function getReviewListingPrice() public view returns (uint256) {
        return reviewListPrice;
    }

    function createMarketItem(
        address itemContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        // require(price > 0, "Price must be at least XXX");
        require(msg.value == listPrice, "Price must be equal to listing price");
        
        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            itemContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false,
            false
        );

        IERC721(itemContract).transferFrom(msg.sender, address(this), tokenId);
    
        emit MarketItemCreated(
            itemId,
            itemContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false,
            false
        );
    }

    function createReview(
        address itemContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        
        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            itemContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            true,
            true
        );

        IERC721(itemContract).transferFrom(msg.sender, address(this), tokenId);
    
        emit reviewCreated(
            itemId,
            itemContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false,
            false
        );
    }

    function createMarketSale(
        address itemContract,
        uint itemId
    ) public payable nonReentrant {
        uint price = idToMarketItem[itemId].price;
        uint tokenId = idToMarketItem[itemId].tokenId;
        require(msg.value == price, "Please submit the price shown to purchase this item");

        idToMarketItem[itemId].seller.transfer(msg.value);                          // transfer sale value to seller
        IERC721(itemContract).transferFrom(address(this), msg.sender, tokenId);     // sends digital asset to buyer
        idToMarketItem[itemId].owner = payable(msg.sender);                         // sets new owner of this item
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(listPrice);                                         // owner of marketplace is transferred listing fee
    }


    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint itemCount = _itemIds.current();
        uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint i=0; i<itemCount; i++) {
            if (idToMarketItem[i+1].owner == address(0)) {
                uint currentId = idToMarketItem[i+1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    function fetchMyItems() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i=0; i<totalItemCount; i++) {
            if (idToMarketItem[i+1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i=0; i<totalItemCount; i++) {
            if (idToMarketItem[i+1].owner == msg.sender) {
                uint currentId = idToMarketItem[i+1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

        function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i=0; i<totalItemCount; i++) {
            if (idToMarketItem[i+1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i=0; i<totalItemCount; i++) {
            if (idToMarketItem[i+1].seller == msg.sender) {
                uint currentId = idToMarketItem[i+1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
}