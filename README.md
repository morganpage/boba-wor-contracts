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
npx hardhat ignition deploy ./ignition/modules/Rogues.ts --network boba_sepolia
npx hardhat ignition deploy ./ignition/modules/RoguesItems.ts --network boba_sepolia
```

Deploy to Boba Mainnet Network with
```shell
npx hardhat ignition deploy ./ignition/modules/Rogues.ts --network boba
npx hardhat ignition deploy ./ignition/modules/RoguesItems.ts --network boba
```
