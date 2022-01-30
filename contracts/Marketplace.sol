//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import 'hardhat/console.sol';

contract Marketplace is ERC721Holder, Ownable, ReentrancyGuard {
  /// @notice itemId to keep track of the number of items listed for sale on the marketplace
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;

  /// @dev owner of the marketplace contract, set in constructor
  address payable marketplaceOwner;

  /** 
    @notice Royalties charged by the marketplace 
    @dev Value set in constructor 
 */
  uint256 public royalties;

  /// @notice maps itemId to Item struct
  mapping(uint256 => Item) private MarketItems;

  /// @notice Item struct to track details of items listed on the marketplace
  struct Item {
    address nftAddress;
    uint256 tokenId;
    uint256 itemId;
    address creator;
    address payable seller;
    address payable owner;
    uint256 price;
    bool isListed;
  }
  event ItemListed(
    address indexed nftAddress,
    uint256 indexed tokenId,
    uint256 indexed itemId,
    address creator,
    address seller,
    address owner,
    uint256 price,
    bool isListed
  );

  /** 
    @notice Sets the owner of the Marketplace contract as the contract deployer, and initializes proportion of royalties that will go to the marketplace.
    @param royalty takes a value between 
 */
  constructor(uint256 royalty) {
    marketplaceOwner = payable(msg.sender);
    royalties = royalty;
  }

  /**
    @notice Executes listing of item by adding new items into the mapping. Requires holder to call setApprovalForAll before calling this function. 
    @dev Transfers the NFT from the owner's wallet to the marketplace. 
    @param nftAddress contract address of the NFT to be listed  
    @param _tokenId tokenId of the NFT to be listed
    @param price list price of each listed NFT
    */
  function listItem(
    address nftAddress,
    uint256 _tokenId,
    uint256 price
  ) public {
    _itemIds.increment();
    uint256 itemId = _itemIds.current();
    MarketItems[itemId] = Item(
      nftAddress,
      _tokenId,
      itemId,
      msg.sender,
      payable(msg.sender),
      payable(msg.sender),
      price,
      true
    );

    emit ItemListed(nftAddress, _tokenId, itemId, msg.sender, msg.sender, address(0), price, true);
  }

  /**
    @notice Allows buyer to purchase one or more NFTs 
    @dev Transfers the desired quantity of tokens from the marketplace to the buyer 
    @dev Transfer a portion of ether sent by the buyer to the marketplace as royalties. Remaining ether is transferred to the seller. 
    @param nftAddress contract address of the NFT to be purchased
    @param _itemId itemId of the NFT to be purchased 
    */
  function purchaseItem(address nftAddress, uint256 _itemId) public payable nonReentrant {
    uint256 price = MarketItems[_itemId].price;
    uint256 _tokenId = MarketItems[_itemId].tokenId;
    bool isForSale = MarketItems[_itemId].isListed;
    address owner = MarketItems[_itemId].owner;

    require(isForSale == true, 'Item requested is not for sale.');
    require(msg.value == price, 'Please submit the correct amount of ether.');

    // get RoyaltyInfo from nft contract

    uint256 royaltiesToMarketplace = ((royalties * msg.value) / 100);
    uint256 etherToSeller = msg.value - royaltiesToMarketplace;

    IERC721(nftAddress).transferFrom(owner, msg.sender, _tokenId);

    MarketItems[_itemId].owner = payable(msg.sender);
    MarketItems[_itemId].isListed = false;

    (bool royaltiesTransferred, ) = payable(marketplaceOwner).call{ value: royaltiesToMarketplace }('');
    require(royaltiesTransferred, 'Failed to transfer royalties to marketplace.');

    (bool salePriceTransferred, ) = MarketItems[_itemId].seller.call{ value: etherToSeller }('');
    require(salePriceTransferred, 'Failed to transfer sale price to seller.');
  }

  // ------------------ Read Functions ---------------------- //

  function getListedItems() public view returns (Item[] memory) {
    uint256 totalItemCount = _itemIds.current();
    uint256 itemsListedCount = 0;
    uint256 resultItemId = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
      if (MarketItems[i + 1].isListed == true) {
        itemsListedCount++;
      }
    }

    Item[] memory listedItems = new Item[](itemsListedCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
      if (MarketItems[i + 1].isListed == true) {
        uint256 thisItemId = MarketItems[i + 1].itemId;
        Item storage thisItem = MarketItems[thisItemId];
        listedItems[resultItemId] = thisItem;
        resultItemId++;
      }
    }
    return listedItems;
  }

  // ------------------ Modifiers ---------------------- //

  modifier onlyItemOwner(uint256 id) {
    require(MarketItems[id].owner == msg.sender, 'Only product owner can do this operation');
    _;
  }
}
