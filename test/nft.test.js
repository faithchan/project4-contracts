const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT", () => {
  beforeEach(async () => {
    [owner, minter, receiver] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy();
    await nft.deployed();
  });

  describe("Deployment", async () => {
    it("has a name", async () => {
      expect(await nft.name()).to.equal("Gallery Token");
    });

    it("has a symbol", async () => {
      expect(await nft.symbol()).to.equal("GTKN");
    });

    it("sets the owner as contract deployer", async () => {
      expect(await nft.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", async () => {
    it("mints tokens to msg sender", async () => {});
  });

  describe("Transfers", async () => {
    it("transfers tokens", async () => {});
  });

  describe("Burning", async () => {
    it("burns tokens", async () => {});
  });
});
