import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

const RoguesItemsModule = buildModule("RoguesItemsModule", (m) => {
  const deployer = m.getAccount(0);
  const contract = m.contract("RoguesItems", [deployer, deployer, deployer]);
  return {contract};
});

export default RoguesItemsModule;
