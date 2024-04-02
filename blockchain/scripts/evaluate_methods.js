const config = require('../includes/config.json');

const USER_ADDRESS = config.user_address;
const PRIVATE_KEY = config.private_key;
const CONTRACT_ADDRESS = config.contract_address;
const CONTRACT_ABI = config.contract_abi;
const HTTP_PROVIDER = config.provider_endpoint_send;
const WSS_PROVIDER = config.provider_endpoint_fetch;

const REQUESTS = 2;
const MAX_GAS_FEE = 10000000;
const GAS_PRICE = ethers.utils.parseUnits('10', 'gwei');

const methods = [
  {'name': "getRole", 'type': "fetch", "args": []},
  {'name': "requestAuthorisation", 'type': "send", "args": ["test"]},
  {'name': "getAuthorisation", 'type': "fetch", "args": []},
  {'name': "accessDoor", 'type': "send", "args": []},
  {'name': "getAccesses()", 'type': "fetch", "args": []},
  {'name': "getData", 'type': "fetch", "args": []},
  {'name': "createAuthorisation", 'type': "send", "args": ["test", USER_ADDRESS]},
  {'name': "acceptAuthorisation", 'type': "send", "args": [USER_ADDRESS]},
  {'name': "rejectAuthorisation", 'type': "send", "args": [USER_ADDRESS]},
  {'name': "getAccesses(address)", 'type': "fetch", "args": [USER_ADDRESS]},
  {'name': "reset", 'type': "send", "args": []},
]

let receivedTimes = [], sentTimes = [];

async function receive(contract) {
  const filter = contract.filters.updateOwner();

  contract.on(filter, (setter, event) => {
    receivedTimes.push(Date.now());
  });
}

async function send(contract, method_name, method_type, method_args) {
  for(let index = 0; index < REQUESTS; index++) {
    if(method_type == "send") {
      const transaction = await contract[method_name](...method_args, {gasLimit: MAX_GAS_FEE, gasPrice: GAS_PRICE });

      sentTimes.push(Date.now());

      await transaction.wait();
    } else if(method_type == "fetch") {
      sentTimes.push(Date.now());

      await contract[method_name](...method_args);

      receivedTimes.push(Date.now());
    }
  }
}

async function poll() {
  while(sentTimes.length < REQUESTS || receivedTimes.length < REQUESTS) {
    await timer(10);
  }
}

async function main() {
  const wallet = new ethers.Wallet(PRIVATE_KEY);

  const httpProvider = new ethers.providers.JsonRpcProvider(HTTP_PROVIDER);
  const httpSigner = wallet.connect(httpProvider);

  const wssProvider = new ethers.providers.WebSocketProvider(WSS_PROVIDER);
  const wssSigner = wssProvider.getSigner();

  const contract_send = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, httpSigner);
  const contract_fetch = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wssSigner);

  await receive(contract_fetch);

  let sendResults = [], fetchResults = [];
  let results = [];

  console.log("Evaluation based on " + REQUESTS + " calls for each method");

  for(let methodIndex = 0; methodIndex < methods.length; methodIndex++) {
    await send(contract_send, methods[methodIndex].name, methods[methodIndex].type, methods[methodIndex].args);
    await poll();

    let differences = [];

    for(let index = 0; index < sentTimes.length; index++) {
      differences.push((receivedTimes[index] - sentTimes[index]) / 1000);
    }

    const average = getAverage(differences);
    const minimum = Math.min(...differences);
    const maximum = Math.max(...differences);

    results.push(average);

    if(methods[methodIndex].type == "send") {
      sendResults.push(average);
    } else if(methods[methodIndex].type == "fetch") {
      fetchResults.push(average);
    } 

    console.log("Minimum - Average - Maximum time for '" + methods[methodIndex].name + "': " + minimum.toFixed(3) + " - " + + average.toFixed(3) + " - " + + maximum.toFixed(3));

    receivedTimes = [];
    sentTimes = [];
  }

  console.log("");
  console.log("Average time for send methods: " + getAverage(sendResults).toFixed(3));
  console.log("Average time for fetch methods: " + getAverage(fetchResults).toFixed(3));
  console.log("Average time for all methods: " + getAverage(results).toFixed(3));
}

const timer = ms => new Promise(res => setTimeout(res, ms));

const getAverage = (array) =>
  array.reduce((sum, currentValue) => sum + currentValue, 0) / array.length;

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

  