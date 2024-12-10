import {ethers} from "hardhat";

async function main() {
  //Example script
  const [deployer] = await ethers.getSigners();
  const contract = await ethers.deployContract("Rogues", [deployer]);
  await contract.waitForDeployment();
  const owner = await contract.owner();
  let totalSupply = await contract.totalSupply();
  let txnMint = await contract.mintForOwner(10);
  await txnMint.wait();
  totalSupply = await contract.totalSupply();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
