//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract NFT is ERC721, Ownable {
    /// @notice _tokenIds to keep track of the number of NFTs minted
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    /// @notice address of marketplace contract to set permissions
    address private marketplace;

    /// @notice store tokenURIs for each tokenId
    mapping(uint256 => string) private _uris;

    /// @notice Mapping from token ID to the creator's address.
    mapping(uint256 => address) private creators;

    /// @notice Mapping from token ID to the creator's address.
    mapping(address => uint256) private owners;

    constructor(address marketplaceAddress) ERC721("Arkiv", "ARKV") {
        marketplace = marketplaceAddress;
    }

    // ------------------ Mutative Functions ---------------------- //

    function mint(string memory tokenURI) public returns (uint256 _tokenId) {
        // require(to != address(0));
        _tokenIds.increment();
        uint256 currentTokenId = _tokenIds.current();
        _uris[currentTokenId] = tokenURI;
        _safeMint(msg.sender, currentTokenId);
        return _tokenId;
    }

    function burn(uint256 tokenId) public onlyTokenOwner(tokenId) {
        _burn(tokenId);
    }

    // ----------------------- Read Functions --------------------------- //

    function getTokenURI(uint256 _tokenId) public view returns (string memory) {
        return (_uris[_tokenId]);
    }

    // ----------------------- Modifiers --------------------------- //
    modifier onlyTokenOwner(uint256 _tokenId) {
        address owner = ownerOf(_tokenId);
        require(owner == msg.sender, "must be the owner of the token");
        _;
    }
}
