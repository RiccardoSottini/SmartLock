/* Import configuration file */
const config = require("../includes/config.json");

/* Setup configuration constants */
const USER_ADDRESS = config.user_address;
const PRIVATE_KEY = config.private_key;
const CONTRACT_ADDRESS = config.contract_address;
const CONTRACT_ABI = config.contract_abi;
const HTTP_PROVIDER = config.provider_endpoint_send;

/* List of contract methods with the type of action done and their arguments */
const methods = [
  { name: "getRole", type: "view", args: [] },
  { name: "requestAuthorisation", type: "payable", args: ["test"] },
  { name: "getAuthorisation", type: "view", args: [] },
  { name: "accessDoor", type: "payable", args: [] },
  { name: "getAccesses()", type: "view", args: [] },
  { name: "getData", type: "view", args: [] },
  { name: "createAuthorisation", type: "payable", args: ["test", USER_ADDRESS] },
  { name: "acceptAuthorisation", type: "payable", args: [USER_ADDRESS] },
  { name: "rejectAuthorisation", type: "payable", args: [USER_ADDRESS] },
  { name: "getAccesses(address)", type: "view", args: [USER_ADDRESS] },
  { name: "reset", type: "payable", args: [] },
];

/* Function used to format the estimated gas and print it on screen */
function print(method_name, method_type, estimated_gas) {
    /* Format the label */
    let label = "Estimated gas for '" + method_name + "' (" + method_type + "): ";
    const pad_space = 54 + 6 - estimated_gas.length;

    /* Print the label and the estimated gas */
    console.log(label.padEnd(pad_space) + estimated_gas);
}

/* Function used to estimate the gas fee for a method call */
async function estimate(contract, method_name, method_type, method_args) {
  try {
    /* Use the contract instance for estimating the gas consumption for the method call */
    const estimated_gas = await contract.estimateGas[method_name](...method_args);

    /* Call the function to print the estimation */
    print(method_name, method_type, estimated_gas.toString());
  } catch (error) {
    /* Print that the transaction failed */
    console.error("Transaction failed: ", error);
  }
}

/* Main function - entry point of the program */
async function main() {
  /* Setup the instance that replicates a blockchain wallet, by inserting the private key */
  const wallet = new ethers.Wallet(PRIVATE_KEY);

  /* Setup the provider and signer using the blockchain provider http url */
  const httpProvider = new ethers.providers.JsonRpcProvider(HTTP_PROVIDER);
  const httpSigner = wallet.connect(httpProvider);

  /* Setup the contract instance to send method calls altering data */
  const contract_send = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    httpSigner
  );
  
  /* Print the header of the program */
  console.log("Estimation of the gas consumption for each smart contract method");
  console.log("");

  /* Loop through the list of methods */
  for (let methodIndex = 0; methodIndex < methods.length; methodIndex++) {
    /* Call the function to estimate the gas consumption for a specific method */
    await estimate(
      contract_send,
      methods[methodIndex].name,
      methods[methodIndex].type,
      methods[methodIndex].args
    );
  }
}

/* Setup the program execution - useful for HardHat */
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
