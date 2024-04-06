const config = require("../includes/config.json");

const USER_ADDRESS = config.user_address;
const PRIVATE_KEY = config.private_key;
const CONTRACT_ADDRESS = config.contract_address;
const CONTRACT_ABI = config.contract_abi;
const HTTP_PROVIDER = config.provider_endpoint_send;

const MAX_GAS_FEE = 10000000;
const GAS_PRICE = ethers.utils.parseUnits("10", "gwei");

const methods = [
  { name: "getRole", type: "fetch", args: [] },
  { name: "requestAuthorisation", type: "send", args: ["test"] },
  { name: "getAuthorisation", type: "fetch", args: [] },
  { name: "accessDoor", type: "send", args: [] },
  { name: "getAccesses()", type: "fetch", args: [] },
  { name: "getData", type: "fetch", args: [] },
  { name: "createAuthorisation", type: "send", args: ["test", USER_ADDRESS] },
  { name: "acceptAuthorisation", type: "send", args: [USER_ADDRESS] },
  { name: "rejectAuthorisation", type: "send", args: [USER_ADDRESS] },
  { name: "getAccesses(address)", type: "fetch", args: [USER_ADDRESS] },
  { name: "reset", type: "send", args: [] },
];

function print(method_name, method_type, estimated_gas) {
    let label = "Estimated gas for '" + method_name + "' (" + method_type + "): ";
    const pad_space = 54 + 6 - estimated_gas.length;

    console.log(label.padEnd(pad_space) + estimated_gas);
}

async function estimate(contract, method_name, method_type, method_args) {
  try {
    const estimated_gas = await contract.estimateGas[method_name](...method_args);

    print(method_name, method_type, estimated_gas.toString());
  } catch (error) {
    console.error("Transaction failed: ", error);
  }
}

async function main() {
  const wallet = new ethers.Wallet(PRIVATE_KEY);

  const httpProvider = new ethers.providers.JsonRpcProvider(HTTP_PROVIDER);
  const httpSigner = wallet.connect(httpProvider);

  const contract_send = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    httpSigner
  );
  
  console.log("Estimation of the gas fees for each smart contract method");
  console.log("");

  for (let methodIndex = 0; methodIndex < methods.length; methodIndex++) {
    await estimate(
      contract_send,
      methods[methodIndex].name,
      methods[methodIndex].type,
      methods[methodIndex].args
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
