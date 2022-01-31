const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Marketplace', () => {
  let marketplace
  let nft
  let marketplaceFee = 250

  beforeEach(async () => {
    ;[contractOwner, minter, receiver] = await ethers.getSigners()
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
})
