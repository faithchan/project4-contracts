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

  /** 
    @notice Royalties charged by the marketplace 
    @dev Value set in constructor 
 */
  uint256 public royalties;

  /// @dev owner of the marketplace contract, set in constructor
  address payable marketplaceOwner;

  /** 
    @notice Sets the owner of the Marketplace contract as the contract deployer, and initializes proportion of royalties that will go to the marketplace.
    @param royalty takes a value between 
 */
  constructor(uint256 royalty) {
    marketplaceOwner = payable(msg.sender);
    royalties = royalty;
  }
}
