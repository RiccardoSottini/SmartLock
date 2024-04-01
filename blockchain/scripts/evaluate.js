const CONTRACT_ADDRESS = "0x8701B311CAd384D7DB2Fa63b6179ae942707e4a4";

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