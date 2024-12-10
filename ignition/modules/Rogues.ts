import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

const RoguesModule = buildModule("RoguesModule", (m) => {
  const deployer = m.getAccount(0);
  const contract = m.contract("Rogues", [deployer]);
  return {contract};
});

export default RoguesModule;
