import {ethers} from "hardhat";

async function main() {
  const contractFactoryRoguesItems = (await ethers.getContractFactory("RoguesItems")) as any;
  const RoguesItems = await contractFactoryRoguesItems.attach("0x56438B4ed61d67529b3d552FB2388587613CbBC8");

  const contractFactoryDailyStreakSystem = (await ethers.getContractFactory("DailyStreakSystem")) as any;
  const DailyStreakSystem = await contractFactoryDailyStreakSystem.attach("0x2c9be5B5fB1eC1f77744c53a132dE412f47a6Adf");

  if (RoguesItems == null) {
    console.log("Contract not found");
    return;
  }

  if (DailyStreakSystem == null) {
    console.log("Contract not found");
    return;
  }

  console.log("Contracts found");
  //First set the uri
  await RoguesItems.setURI("ipfs://QmbtJEzuMC5LjdBp4xhUFrubBGTx3uzHeSdzKvjWjeaNpm/");
  const uri = await RoguesItems.uri(1);
  console.log("URI: ", uri);
  //Then set the minter role so the streak system can mint
  await RoguesItems.grantMinterRole(DailyStreakSystem);
  console.log("Minter role granted");
  //Then set the milestones for the streak system, ie milestone 1 mints token id 11
  await DailyStreakSystem.setTokenMilestone(1, 11);
  await DailyStreakSystem.setTokenMilestone(5, 13);
  await DailyStreakSystem.setTokenMilestone(7, 19);
  console.log("Milestones set");
  //Then claim
  await DailyStreakSystem.claim();
  console.log("Claimed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
