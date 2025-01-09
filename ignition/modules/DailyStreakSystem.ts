import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

const DailyStreakSystemModule = buildModule("DailyStreakSystemModule", (m) => {
  const deployer = m.getAccount(0);
  const contract = m.contract("DailyStreakSystem", [deployer]);
  return {contract};
});

export default DailyStreakSystemModule;
