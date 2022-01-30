const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const { ZERO_ADDRESS } = constants
const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('NFT', () => {
  let marketplace
  let nft
  let royaltyAmount = 600
  let salePrice = 100
  const token1URI = 'https://ipfs.io/ipfs/QmXmNSH2dyp5R6dkW5MVhNc7xqV9v3NHWxNXJfCL6CcYxS'
  const token2URI = 'https://ipfs.io/ipfs/QmQ35DkX8HHjhkJe5MsMAd4X51iP3MHV5d5dZoee32J83k'

  beforeEach(async () => {
    ;[contractOwner, minter, receiver, operator] = await ethers.getSigners()
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
      const token = await nft.connect(minter).mint(minter.address, token1URI, minter.address, royaltyAmount)
      const txn = await token.wait()
      tokenId = txn.events[0].args.tokenId
    })

    it('mints tokens to msg sender', async () => {
      expect(await nft.balanceOf(minter.address)).to.equal(1)
    })

    it('sets owner of token as minter', async () => {
      expect(await nft.ownerOf(tokenId)).to.equal(minter.address)
    })

    it('sets creator of token as creator', async () => {
      expect(await nft.tokenCreator(tokenId)).to.equal(minter.address)
    })

    it('sets tokenURI upon minting', async () => {
      expect(await nft.getTokenURI(tokenId)).to.equal(token1URI)
    })

    it('reverts on mint to null address', async () => {
      await expectRevert(
        nft.mint(ZERO_ADDRESS, token1URI, ZERO_ADDRESS, royaltyAmount),
        'ERC721: mint to the zero address'
      )
    })
  })

  describe('Transfers', async () => {
    let tokenId
    beforeEach(async () => {
      const token = await nft.mint(minter.address, token1URI, minter.address, royaltyAmount)
      const txn = await token.wait()
      tokenId = txn.events[0].args.tokenId
    })

    it('allows owner to transfer tokens using transferFrom', async () => {
      await nft.connect(minter).transferToken(minter.address, receiver.address, tokenId)
      expect(await nft.balanceOf(minter.address)).to.equal(0)
      expect(await nft.balanceOf(receiver.address)).to.equal(1)
    })

    it('allows approved operator to transfer tokens using transferFrom', async () => {
      await nft.connect(minter).approve(operator.address, tokenId)
      await nft.connect(operator).transferToken(minter.address, receiver.address, tokenId)
      expect(await nft.balanceOf(minter.address)).to.equal(0)
      expect(await nft.balanceOf(receiver.address)).to.equal(1)
    })

    it('reverts if caller is not owner or approved operator ', async () => {
      await expectRevert(
        nft.transferToken(minter.address, receiver.address, tokenId),
        'ERC721: transfer caller is not owner nor approved'
      )
    })
  })

  describe('Burning', async () => {
    let tokenId
    beforeEach(async () => {
      const token = await nft.mint(minter.address, token1URI, minter.address, royaltyAmount)
      const txn = await token.wait()
      tokenId = txn.events[0].args.tokenId
    })

    it('only allows token owner to burn tokens', async () => {
      await nft.connect(minter).burn(tokenId)
      expect(await nft.balanceOf(minter.address)).to.equal(0)
    })

    it('reverts if caller is not token owner', async () => {
      await expectRevert(nft.burn(tokenId), 'Caller is not the owner of the token')
    })
  })

  describe('Updating token URI', async () => {
    let tokenId
    beforeEach(async () => {
      const token = await nft.connect(minter).mint(minter.address, token1URI, minter.address, royaltyAmount)
      const txn = await token.wait()
      tokenId = txn.events[0].args.tokenId
    })

    it('allows creator to update URI if they are also the owner', async () => {
      await nft.connect(minter).updateTokenMetadata(tokenId, token2URI)
      expect(await nft.getTokenURI(tokenId)).to.equal(token2URI)
    })

    it('emits a TokenURIUpdated event', async () => {
      await expect(nft.connect(minter).updateTokenMetadata(tokenId, token2URI))
        .to.emit(nft, 'TokenURIUpdated')
        .withArgs(tokenId, token2URI)
    })

    it('reverts if caller is not owner', async () => {
      await expectRevert(nft.updateTokenMetadata(tokenId, token2URI), 'Caller is not the owner of the token')
    })

    it('reverts if caller is not creator', async () => {
      await nft.connect(minter).transferToken(minter.address, receiver.address, tokenId)
      await expectRevert(
        nft.connect(receiver).updateTokenMetadata(tokenId, token2URI),
        'Caller is not the creator of the token'
      )
    })
  })

  describe('Royalties', async () => {
    let tokenId
    beforeEach(async () => {
      const token = await nft.connect(minter).mint(minter.address, token1URI, minter.address, royaltyAmount)
      const txn = await token.wait()
      tokenId = txn.events[0].args.tokenId
    })

    it('sets royalty for specific token upon mint', async () => {
      const txn = await nft.royaltyInfo(tokenId, salePrice)
      expect(txn.receiver).to.equal(minter.address)
      expect(txn.royaltyAmount).to.equal((royaltyAmount * salePrice) / 10000)
    })

    it('updates token royalties', async () => {})
    it('reverts if royalty amount is >10000', async () => {})
    it('reverts if receiver is a null address', async () => {})
  })
})
