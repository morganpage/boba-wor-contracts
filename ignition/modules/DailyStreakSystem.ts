import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

const DailyStreakSystemModule = buildModule("DailyStreakSystemModule", (m) => {
  const deployer = m.getAccount(0);
  const erc1155Address = m.contract("RoguesItems", [deployer, deployer, deployer]);
  const contract = m.contract("DailyStreakSystem", [deployer, erc1155Address]);
  return {contract};
});

export default DailyStreakSystemModule;
