import hre from "hardhat";
import {expect} from "chai";

describe("DailyStreakSystem", function () {
  async function deployDailyStreakSystem() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractFactory("DailyStreakSystem");
    //RoguesItems is the contract name
    const contractERC1155 = await hre.ethers.getContractFactory("RoguesItems");
    const contractERC1155Address = await contractERC1155.deploy(owner, owner, owner);
    const dailyStreakSystem = await contract.deploy(owner, contractERC1155Address);
    await dailyStreakSystem.waitForDeployment();
    //expect the erc1155 contract to have the address of the dailyStreakSystem contract
    let contractAddress = await dailyStreakSystem.externalERC1155();
    expect(contractAddress).to.equal(contractERC1155Address);
    await contractERC1155Address.grantMinterRole(dailyStreakSystem);
    return {dailyStreakSystem, owner, otherAccount, contractERC1155Address};
  }

  describe("Deployment", function () {
    it("Streak should be zero", async function () {
      const {dailyStreakSystem, owner, otherAccount} = await deployDailyStreakSystem();
      expect(await dailyStreakSystem.getStreak(otherAccount)).to.equal(0n);
    });
    it("Last claimed should be zero", async function () {
      const {dailyStreakSystem, owner, otherAccount} = await deployDailyStreakSystem();
      expect(await dailyStreakSystem.getLastClaimed(otherAccount)).to.equal(0n);
    });
  });

  describe("Adding Milestones", function () {
    it("Should add milestone successfully", async function () {
      const {dailyStreakSystem, owner, otherAccount} = await deployDailyStreakSystem();
      expect(await dailyStreakSystem.milestoneToTokenId(1)).to.equal(0n);
      await dailyStreakSystem.setTokenMilestone(1, 11); //Add tokenId 11 as milestone 1 reward
      let milestones = await dailyStreakSystem.getTokenMilestones();
      expect(milestones[0][0]).to.equal(1);
      expect(milestones[1][0]).to.equal(11);
      expect(await dailyStreakSystem.milestoneToTokenId(1)).to.equal(11n);
    });
    it("Only owner should be able to add milestones", async function () {
      const {dailyStreakSystem, owner, otherAccount} = await deployDailyStreakSystem();
      expect(dailyStreakSystem.connect(otherAccount).setTokenMilestone(1, 11)).to.be.revertedWith("");
      expect(await dailyStreakSystem.milestoneToTokenId(1)).to.equal(0n);
    });
  });

  describe("Claiming", function () {
    it("Should claim successfully", async function () {
      const {dailyStreakSystem, owner, otherAccount} = await deployDailyStreakSystem();
      const txResponse = await dailyStreakSystem.claim();
      const txReceipt = await txResponse.wait();
      const streak = (txReceipt?.logs?.[0] as any).args[1]; //Pull the streak from the event, just for testing
      const tokenId = (txReceipt?.logs?.[0] as any).args[2]; //Pull the tokenId from the event, just for testing
      console.log(`Streak: ${streak}, TokenId: ${tokenId}`);
      expect(await dailyStreakSystem.getStreak(owner)).to.equal(1n);
    });
    it("Owner can claim for another user successfully", async function () {
      const {dailyStreakSystem, owner, otherAccount} = await deployDailyStreakSystem();
      await dailyStreakSystem.claimFor(otherAccount);
      expect(await dailyStreakSystem.getStreak(otherAccount)).to.equal(1n);
    });
    it("Claiming twice should fail", async function () {
      const {dailyStreakSystem, owner, otherAccount} = await deployDailyStreakSystem();
      await dailyStreakSystem.claim();
      await expect(dailyStreakSystem.claim()).to.be.revertedWith("You can only claim once per day");
    });
    it("Claiming twice within 24hrs should fail", async function () {
      const {dailyStreakSystem, owner, otherAccount} = await deployDailyStreakSystem();
      await dailyStreakSystem.claim();
      await hre.network.provider.send("evm_increaseTime", [60 * 60 * 23]);
      await expect(dailyStreakSystem.claim()).to.be.revertedWith("You can only claim once per day");
      expect(await dailyStreakSystem.getStreak(owner.address)).to.equal(1n);
    });
    it("Claiming twice after 48hrs should reset streak", async function () {
      const {dailyStreakSystem, owner, otherAccount} = await deployDailyStreakSystem();
      await dailyStreakSystem.claim();
      await hre.network.provider.send("evm_increaseTime", [60 * 60 * 24]);
      await dailyStreakSystem.claim();
      expect(await dailyStreakSystem.getStreak(owner.address)).to.equal(2n);
      await hre.network.provider.send("evm_increaseTime", [60 * 60 * 48 + 1]);
      await dailyStreakSystem.claim();
      expect(await dailyStreakSystem.getStreak(owner.address)).to.equal(1n);
    });
    it("Should claim successfully after 24 hours", async function () {
      const {dailyStreakSystem, owner, otherAccount} = await deployDailyStreakSystem();
      await dailyStreakSystem.connect(otherAccount).claim();
      await hre.network.provider.send("evm_increaseTime", [60 * 60 * 24]);
      await dailyStreakSystem.connect(otherAccount).claim();
      expect(await dailyStreakSystem.connect(otherAccount).getStreak(otherAccount)).to.equal(2n);
    });

    it("Should claim successfully after 24 hours", async function () {
      const {dailyStreakSystem, owner, otherAccount} = await deployDailyStreakSystem();
      await dailyStreakSystem.connect(otherAccount).claim();
      await dailyStreakSystem.claimHoursAgo(otherAccount, 48);
      // console.log(await dailyStreakSystem.timeUntilCanClaim(otherAccount));
      // console.log(await dailyStreakSystem.timeUntilStreakReset(otherAccount));
      await dailyStreakSystem.connect(otherAccount).claim();
      expect(await dailyStreakSystem.connect(otherAccount).getStreak(otherAccount.address)).to.equal(1n);
    });
    it("Should mint NFT 11 on successful claim of a milestone", async function () {
      const {dailyStreakSystem, owner, otherAccount, contractERC1155Address} = await deployDailyStreakSystem();
      await dailyStreakSystem.setTokenMilestone(1, 11); //Add tokenId 11 as milestone 1 reward
      const txResponse = await dailyStreakSystem.claim();
      const txReceipt = await txResponse.wait();
      const streak = (txReceipt?.logs?.[0] as any).args[1]; //Pull the streak from the event, just for testing
      const tokenId = (txReceipt?.logs?.[0] as any).args[2]; //Pull the tokenId from the event, just for testing
      console.log(`Streak: ${streak}, TokenId: ${tokenId}`);
      expect(await dailyStreakSystem.getStreak(owner)).to.equal(1n);
      expect(await contractERC1155Address.balanceOf(owner, 11)).to.equal(1n);
    });
    it("Should mint NFT 12,13 on successful claim of milestones", async function () {
      const {dailyStreakSystem, owner, otherAccount, contractERC1155Address} = await deployDailyStreakSystem();
      await dailyStreakSystem.setTokenMilestone(2, 12);
      await dailyStreakSystem.setTokenMilestone(3, 13);
      //Should return 13 for milestone 3
      expect(await dailyStreakSystem.milestoneToTokenId(3)).to.equal(13n);
      await dailyStreakSystem.connect(otherAccount).claim();
      await hre.network.provider.send("evm_increaseTime", [60 * 60 * 24]);
      await dailyStreakSystem.connect(otherAccount).claim();
      await hre.network.provider.send("evm_increaseTime", [60 * 60 * 24]);
      await dailyStreakSystem.connect(otherAccount).claim();
      expect(await dailyStreakSystem.getStreak(otherAccount)).to.equal(3n);
      expect(await contractERC1155Address.balanceOf(otherAccount, 12)).to.equal(1n);
      expect(await contractERC1155Address.balanceOf(otherAccount, 13)).to.equal(1n);
    });
  });
});
