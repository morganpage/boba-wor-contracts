# World of Rogues Game Contracts

These are the main smart contract for World of Rogues, a post-apocalyptic, survival MMO on the Boba blockchain.

Compile with
```shell
npx hardhat compile
```

Run tests
```shell
npx hardhat test
```

Deploy to Boba Sepolia Network with
```shell
npx hardhat ignition deploy ./ignition/modules/DeployAll.ts --network boba_sepolia
```

Deploy to Boba Mainnet Network with
```shell
npx hardhat ignition deploy ./ignition/modules/DeployAll.ts --network boba
```

Verify
```shell
npx hardhat verify --network boba_sepolia 0xfab43617B1Fa1fB3CCa323FCC2FC3DFe9E877B2B 0xfab43617B1Fa1fB3CCa323FCC2FC3DFe9E877B2B
npx hardhat verify --network boba_sepolia 0xC997317CB590e9946444b1aF72180ee9901989a9 0xeE602f2b7Ebce91171B55c69029bc47Dcc4Bae4b 0xeE602f2b7Ebce91171B55c69029bc47Dcc4Bae4b 0xeE602f2b7Ebce91171B55c69029bc47Dcc4Bae4b
```

For major changes, you may need to wipe past deploys
```shell
npx hardhat ignition wipe chain-28882 RoguesItemsModule#RoguesItems
```
