import hre from "hardhat";
import {expect} from "chai";

describe("DailyStreakSystem", function () {
  async function deployDailyStreakSystem() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const contract = await hre.ethers.getContractFactory("DailyStreakSystem");
    const dailyStreakSystem = await contract.deploy(owner);
    await dailyStreakSystem.waitForDeployment();
    return {dailyStreakSystem, owner, otherAccount};
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

  describe("Claiming", function () {
    it("Should claim successfully", async function () {
      const {dailyStreakSystem, owner, otherAccount} = await deployDailyStreakSystem();
      await dailyStreakSystem.claim();
      expect(await dailyStreakSystem.getStreak(owner)).to.equal(1n);
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
      console.log(await dailyStreakSystem.timeUntilCanClaim(otherAccount));
      console.log(await dailyStreakSystem.timeUntilStreakReset(otherAccount));
      await dailyStreakSystem.connect(otherAccount).claim();
      expect(await dailyStreakSystem.connect(otherAccount).getStreak(otherAccount.address)).to.equal(1n);
    });
  });
  // it("Should claim successfully after 48 hours", async function () {
  //   const {dailyStreakSystem, owner, otherAccount} = await deployDailyStreakSystem();
  //   await dailyStreakSystem.claim({from: otherAccount.address});
  //   await hre.network.provider.send("evm_increaseTime", [60 * 60 * 48]);
  //   await dailyStreakSystem.claim({from: otherAccount.address});
  //   expect(await dailyStreakSystem.getStreak(otherAccount.address)).to.equal(3n);
  // }
});
