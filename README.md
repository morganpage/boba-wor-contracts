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
Only the first parameter matters for verify purposes...
```shell
npx hardhat verify --network boba_sepolia 0x56438B4ed61d67529b3d552FB2388587613CbBC8 0x56438B4ed61d67529b3d552FB2388587613CbBC8
npx hardhat verify --network boba_sepolia 0x2c9be5B5fB1eC1f77744c53a132dE412f47a6Adf 0x2c9be5B5fB1eC1f77744c53a132dE412f47a6Adf 0x2c9be5B5fB1eC1f77744c53a132dE412f47a6Adf
```

For major changes, you may need to wipe past deploys
```shell
npx hardhat ignition wipe chain-28882 DeployAllModule#DeployAll
npx hardhat ignition wipe chain-28882 DeployAllModule#DailyStreakSystem
```

Amend the post-deploy script with the correct contract addresses then run it, this script sets the uri for the erc1155 tokens and give the streak system contract address the minter role so that it can mint nfts
```shell
npx hardhat run scripts/post-deploy.ts --network boba_sepolia
```

Environment variables
```shell
npx hardhat vars list
npx hardhat vars get SEPOLIA_BOBA_PRIVATE_KEY
npx hardhat vars get BOBA_PRIVATE_KEY
```

Latest verify
```shell
npx hardhat verify --network boba 0xbE7C67194099b98F21A54e1272eB5C622D5D31B4 0xbE7C67194099b98F21A54e1272eB5C622D5D31B4
```