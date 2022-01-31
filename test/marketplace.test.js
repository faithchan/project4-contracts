const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Marketplace', () => {
  let marketplace
  let nft
  let marketplaceFee = 250
  let royaltyAmount = 600
  let salePrice = 10
  const token1URI = 'https://ipfs.io/ipfs/QmXmNSH2dyp5R6dkW5MVhNc7xqV9v3NHWxNXJfCL6CcYxS'
  const token2URI = 'https://ipfs.io/ipfs/QmQ35DkX8HHjhkJe5MsMAd4X51iP3MHV5d5dZoee32J83k'

  beforeEach(async () => {
    ;[contractOwner, seller, buyer] = await ethers.getSigners()
    const Marketplace = await ethers.getContractFactory('Marketplace')
    marketplace = await Marketplace.deploy(marketplaceFee)
    await marketplace.deployed()

    const NFT = await ethers.getContractFactory('NFT')
    nft = await NFT.deploy(marketplace.address)
    await nft.deployed()
  })

  describe('Deployment', async () => {
    it('sets the owner as contract deployer', async () => {
      expect(await marketplace.owner()).to.equal(contractOwner.address)
    })
    it('sets the marketplace fee', async () => {
      expect(await marketplace.marketplaceFee()).to.equal(marketplaceFee)
    })
  })

  describe('listItem', async () => {
    let tokenId
    beforeEach(async () => {
      await nft.addToWhitelist(seller.address)
      const token = await nft.connect(seller).mint(seller.address, token1URI, seller.address, royaltyAmount)
      const txn = await token.wait()
      tokenId = txn.events[0].args.tokenId
    })

    it('allows owner of token to list item for sale', async () => {
      await marketplace.connect(seller).listItem(nft.address, tokenId, salePrice)
    })

    it('reverts if non-owner attempts to list item', async () => {})
  })

  describe('purchaseItem', async () => {
    beforeEach(async () => {
      await nft.addToWhitelist(seller.address)
      const token = await nft.connect(seller).mint(seller.address, token1URI, seller.address, royaltyAmount)
      const txn = await token.wait()
      tokenId = txn.events[0].args.tokenId
    })
    it('transfers token to buyer', async () => {})
    it('transfers marketplace fee to contract owner', async () => {})
    it('transfers royalties to the creator of the token', async () => {})
    it('reverts if ether sent does not equal to the salePrice', async () => {})
  })
})
