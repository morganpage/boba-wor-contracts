import {HardhatUserConfig, vars} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const SEPOLIA_BOBA_PRIVATE_KEY = vars.get("SEPOLIA_BOBA_PRIVATE_KEY");
const BOBA_PRIVATE_KEY = vars.get("BOBA_PRIVATE_KEY");

const config: HardhatUserConfig = {
  networks: {
    hardhat: {},
    boba_sepolia: {
      url: "https://sepolia.boba.network",
      accounts: [SEPOLIA_BOBA_PRIVATE_KEY],
    },
    boba: {
      url: "https://mainnet.boba.network",
      accounts: [BOBA_PRIVATE_KEY],
    },
  },
  solidity: "0.8.28",
};

export default config;
