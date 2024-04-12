const GAS_PRICE = ethers.utils.parseUnits("5", "gwei");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const SmartLock = await ethers.getContractFactory("SmartLock");
  const contract = await SmartLock.deploy({ gasPrice: GAS_PRICE });

  console.log("Contract deployed at:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
