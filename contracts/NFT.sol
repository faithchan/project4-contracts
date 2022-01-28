//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract NFT is ERC721, Ownable {
    // Event indicating metadata was updated.
    event TokenURIUpdated(uint256 indexed _tokenId, string _uri);

    /// @notice _tokenIds to keep track of the number of NFTs minted
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    /// @notice address of marketplace contract to set permissions
    address private marketplaceAddress;

    /// @notice store tokenURIs for each tokenId
    mapping(uint256 => string) private _uris;

    /// @notice Mapping from token ID to the creator's address.
    mapping(uint256 => address) private tokenCreators;

    /// @notice Mapping from token ID to the creator's address.
    mapping(address => uint256) private owners;

    constructor(address _marketplaceAddress) ERC721("Arkiv", "ARKV") {
        marketplaceAddress = _marketplaceAddress;
    }

    // ------------------ Mutative Functions ---------------------- //

    function mint(string memory tokenURI) public returns (uint256 _tokenId) {
        _tokenIds.increment();
        uint256 currentTokenId = _tokenIds.current();
        setTokenURI(currentTokenId, tokenURI);
        _safeMint(msg.sender, currentTokenId);
        return _tokenId;
    }

    function burn(uint256 _tokenId) public onlyTokenOwner(_tokenId) {
        _burn(_tokenId);
    }

    function safeTransfer(
        address from,
        address to,
        uint256 tokenId
    ) public {
        _safeTransfer(from, to, tokenId, "");
    }

    /**
     * @dev Updates the token metadata if the owner is also the
     *      creator.
     * @param _tokenId uint256 ID of the token.
     * @param _uri string metadata URI.
     */
    function updateTokenMetadata(uint256 _tokenId, string memory _uri)
        public
        onlyTokenOwner(_tokenId)
        onlyTokenCreator(_tokenId)
    {
        setTokenURI(_tokenId, _uri);
        emit TokenURIUpdated(_tokenId, _uri);
    }

    function setTokenURI(uint256 _tokenId, string memory newURI) public {
        require(bytes(_uris[_tokenId]).length == 0, "Cannot set URI twice.");
        _uris[_tokenId] = newURI;
    }

    // ----------------------- Read Functions --------------------------- //

    function getTokenURI(uint256 _tokenId) public view returns (string memory) {
        return (_uris[_tokenId]);
    }

    /**
     * @dev Gets the creator of the token.
     * @param _tokenId uint256 ID of the token.
     * @return address of the creator.
     */
    function tokenCreator(uint256 _tokenId) public view returns (address) {
        return tokenCreators[_tokenId];
    }

    function getMarketAddress() public view returns (address marketAddress) {
        return marketplaceAddress;
    }

    // ----------------------- Modifiers --------------------------- //

    /**
     * @dev Checks that the token is owned by the sender.
     * @param _tokenId uint256 ID of the token.
     */
    modifier onlyTokenOwner(uint256 _tokenId) {
        address owner = ownerOf(_tokenId);
        require(owner == msg.sender, "must be the owner of the token");
        _;
    }

    /**
     * @dev Checks that the token was created by the sender.
     * @param _tokenId uint256 ID of the token.
     */
    modifier onlyTokenCreator(uint256 _tokenId) {
        address creator = tokenCreator(_tokenId);
        require(creator == msg.sender, "must be the creator of the token");
        _;
    }
}
