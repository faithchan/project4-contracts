const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Marketplace', () => {
  beforeEach(async () => {
    ;[contractOwner, minter, receiver] = await ethers.getSigners()
    const Marketplace = await ethers.getContractFactory('Marketplace')
    marketplace = await Marketplace.deploy()
    await marketplace.deployed()
  })

  // describe('Deployment', async () => {
  //   it('sets the owner as contract deployer', async () => {
  //     expect(await marketplace.owner()).to.equal(contractOwner.address)
  //   })
  // })
})
