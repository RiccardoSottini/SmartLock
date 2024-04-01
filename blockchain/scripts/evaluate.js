const CONTRACT_ADDRESS = vars.get("CONTRACT_ADDRESS");;

async function main() {
    const SmartDoor = await ethers.getContractFactory("SmartDoor");

    const contract = await SmartDoor.attach(CONTRACT_ADDRESS);

    await contract.accessDoor();

    console.log("test");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });