import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {expect} from "chai";
import hre from "hardhat";

const price = hre.ethers.parseEther("0.01");

describe("Rogues", function () {
  async function deployRogues() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractFactory("Rogues");
    const rogues = await contract.deploy(owner);
    await rogues.waitForDeployment();
    await rogues.setMinting(true);
    await rogues.setPrice(price);
    await rogues.setBaseURI("https://example.com/");
    await rogues.setMaxSupply(100);
    return {rogues, owner, otherAccount};
  }
  describe("Deployment", function () {
    it("Should have zero total supply", async function () {
      const {rogues} = await loadFixture(deployRogues);
      expect(await rogues.totalSupply()).to.equal(0);
    });
    it("Should set the right owner", async function () {
      const {rogues, owner} = await loadFixture(deployRogues);
      expect(await rogues.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should mint 10 tokens for the owner", async function () {
      const {rogues} = await loadFixture(deployRogues);
      await rogues.mintForOwner(10);
      expect(await rogues.totalSupply()).to.equal(10);
    });
    it("TokenURI should be correct", async function () {
      const {rogues} = await loadFixture(deployRogues);
      await rogues.mintForOwner(1);
      expect(await rogues.tokenURI(1)).to.equal("https://example.com/1");
    });
    it("Should mint 2 tokens for the payer", async function () {
      const {rogues, otherAccount} = await loadFixture(deployRogues);
      await rogues.connect(otherAccount).mint(2, {value: price + price});
      expect(await rogues.totalSupply()).to.equal(2);
    });
    it("Should fail mint if paused", async function () {
      const {rogues, otherAccount} = await loadFixture(deployRogues);
      await rogues.pause();
      await expect(rogues.connect(otherAccount).mint(1, {value: price})).to.be.revertedWithCustomError(rogues, "EnforcedPause()");
    });
    it("Should fail mint if not enough value", async function () {
      const {rogues, otherAccount} = await loadFixture(deployRogues);
      await expect(rogues.connect(otherAccount).mint(2, {value: price})).to.be.revertedWith("Ether value sent is not correct");
    });
    it("Should be able withdraw ", async function () {
      const {rogues, owner, otherAccount} = await loadFixture(deployRogues);
      expect(await hre.ethers.provider.getBalance(rogues.target)).to.equal(0);
      await rogues.connect(otherAccount).mint(2, {value: price + price});
      expect(await hre.ethers.provider.getBalance(rogues.target)).to.equal(price + price);
      let ownerBalance = await hre.ethers.provider.getBalance(owner.address);
      await rogues.withdraw();
      expect(await hre.ethers.provider.getBalance(rogues.target)).to.equal(0);
      expect(await hre.ethers.provider.getBalance(owner.address)).to.greaterThan(ownerBalance);
    });
    it("Should be able to add a whitelisted address", async function () {
      const {rogues, owner, otherAccount} = await loadFixture(deployRogues);
      await rogues.setWhiteList([otherAccount.address]);
      expect(await rogues.isWhiteListed(otherAccount.address)).to.equal(true);
    });
  });

  describe("Settings", function () {
    it("Should set minting correctly", async function () {
      const {rogues} = await loadFixture(deployRogues);
      await rogues.setMinting(true);
      expect(await rogues.minting()).to.equal(true);
      await rogues.setMinting(false);
      expect(await rogues.minting()).to.equal(false);
    });
    it("Should set max supply correctly", async function () {
      const {rogues} = await loadFixture(deployRogues);
      await rogues.setMaxSupply(1000);
      expect(await rogues.max_supply()).to.equal(1000);
    });
    it("Should set price correctly", async function () {
      const {rogues} = await loadFixture(deployRogues);
      await rogues.setPrice(100);
      expect(await rogues.price()).to.equal(100);
    });
    it("Should set base uri correctly", async function () {
      const {rogues} = await loadFixture(deployRogues);
      await rogues.setBaseURI("https://www.example.com");
      expect(await rogues.baseTokenURI()).to.equal("https://www.example.com");
    });
  });
});
