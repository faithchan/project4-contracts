const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const { ZERO_ADDRESS } = constants
const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('NFT', () => {
  let marketplace
  let nft
  const token1URI = 'https://ipfs.io/ipfs/QmXmNSH2dyp5R6dkW5MVhNc7xqV9v3NHWxNXJfCL6CcYxS'
  const token2URI = 'https://ipfs.io/ipfs/QmQ35DkX8HHjhkJe5MsMAd4X51iP3MHV5d5dZoee32J83k'

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
    let tokenId
    beforeEach(async () => {
      const token = await nft.mint(minter.address, token1URI)
      const txn = await token.wait()
      tokenId = txn.events[0].args.tokenId
    })

    it('mints tokens to msg sender', async () => {
      expect(await nft.balanceOf(minter.address)).to.equal(1)
    })

    it('sets owner of token as minter', async () => {
      expect(await nft.ownerOf(tokenId)).to.equal(minter.address)
    })

    it('sets tokenURI upon minting', async () => {
      expect(await nft.getTokenURI(tokenId)).to.equal(token1URI)
    })

    it('reverts on mint to zero address', async () => {
      await expectRevert(nft.mint(ZERO_ADDRESS, token1URI), 'ERC721: mint to the zero address')
    })
  })

  describe('Transfers', async () => {
    it('transfers tokens', async () => {})
  })

  describe('Burning', async () => {
    it('burns tokens', async () => {})
  })

  describe('Updating token URI', async () => {
    it('burns tokens', async () => {})
  })

  describe('Royalties', async () => {
    it('burns tokens', async () => {})
  })
})
