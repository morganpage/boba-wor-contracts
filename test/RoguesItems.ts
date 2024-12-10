import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {expect} from "chai";
import {Typed, AddressLike, BigNumberish, BytesLike} from "ethers";
import hre from "hardhat";

describe("RoguesItems", function () {
  async function deployRoguesItems() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractFactory("RoguesItems");
    const roguesItems = await contract.deploy(owner);
    await roguesItems.waitForDeployment();
    await roguesItems.setURI("https://example.com/");
    return {roguesItems, owner, otherAccount};
  }
  describe("Deployment", function () {
    it("Should have zero total supply", async function () {
      const {roguesItems, owner} = await loadFixture(deployRoguesItems);
      expect(await roguesItems.balanceOf(owner.address, 1)).to.equal(0n);
    });
    it("Should set the right owner", async function () {
      const {roguesItems, owner} = await loadFixture(deployRoguesItems);
      expect(await roguesItems.owner()).to.equal(owner.address);
    });
  });
  describe("Minting", function () {
    it("Should mint batches of tokens successfully", async function () {
      const {roguesItems, owner, otherAccount} = await loadFixture(deployRoguesItems);
      const addr: Typed | AddressLike[] = [owner, otherAccount];
      const ids: Typed | BigNumberish[] = [1, 3];
      const qty: Typed | BigNumberish[] = [1, 20];
      const data: Typed | BytesLike = "0x";
      await roguesItems.mintBatchAddr(addr, ids, qty, data);
      expect(await roguesItems.balanceOf(owner, 1)).to.equal(1n);
      expect(await roguesItems.balanceOf(otherAccount, 3)).to.equal(20n);
    });
    it("TokenURI should be correct", async function () {
      const {roguesItems, owner} = await loadFixture(deployRoguesItems);
      await roguesItems.mint(owner, 1, 1, "0x");
      expect(await roguesItems.uri(1)).to.equal("https://example.com/1");
    });
    it("Set approval for all should work", async function () {
      const {roguesItems, owner, otherAccount} = await loadFixture(deployRoguesItems);
      expect(await roguesItems.isApprovedForAll(owner, otherAccount)).to.equal(false);
      await roguesItems.setApprovalForAll(otherAccount, true);
      expect(await roguesItems.isApprovedForAll(owner, otherAccount)).to.equal(true);
    });
  });
});
