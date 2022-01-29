const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('NFT', () => {
  let marketplace
  let nft

  beforeEach(async () => {
    ;[contractOwner, minter, receiver] = await ethers.getSigners()
    const Marketplace = await hre.ethers.getContractFactory('Marketplace')
    marketplace = await Marketplace.deploy()
    await marketplace.deployed()

    const NFT = await ethers.getContractFactory('NFT')
    nft = await NFT.deploy(marketplace.address)
    await nft.deployed()
  })

  describe('Deployment', async () => {
    it('has a name', async () => {
      expect(await nft.name()).to.equal('Arkiv')
    })

    it('has a symbol', async () => {
      expect(await nft.symbol()).to.equal('ARKV')
    })

    it('sets the owner as contract deployer', async () => {
      expect(await nft.owner()).to.equal(contractOwner.address)
    })
  })

  describe('Minting', async () => {
    it('mints tokens to msg sender', async () => {})
  })

  describe('Transfers', async () => {
    it('transfers tokens', async () => {})
  })

  describe('Burning', async () => {
    it('burns tokens', async () => {})
  })
})
