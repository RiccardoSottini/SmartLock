async function main() {

    const [deployer] = await ethers.getSigners();

    console.log(
    "Deploying contracts with the account:",
    deployer.address
    );

    const HelloWorld = await ethers.getContractFactory("SmartDoor");
    const contract = await HelloWorld.deploy();

    console.log("Contract deployed at:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });