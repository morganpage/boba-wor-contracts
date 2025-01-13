import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

const DeployAllModule = buildModule("DeployAllModule", (m) => {
  const deployer = m.getAccount(0);
  const Rogues = m.contract("Rogues", [deployer]);
  const RoguesItems = m.contract("RoguesItems", [deployer, deployer, deployer]);
  const DailyStreakSystem = m.contract("DailyStreakSystem", [deployer, RoguesItems]);
  return {DailyStreakSystem, RoguesItems, Rogues};
});

export default DeployAllModule;
