const config = require('../includes/config.json');

const PRIVATE_KEY = config.private_key;
const CONTRACT_ADDRESS = config.contract_address;
const CONTRACT_ABI = config.contract_abi;
const HTTP_PROVIDER = config.provider_endpoint_send;
const WSS_PROVIDER = config.provider_endpoint_fetch;

const REQUESTS = 25;
const MAX_GAS_FEE = 10000000;
const GAS_PRICE = ethers.utils.parseUnits('10', 'gwei');

let receivedTimes = [], sentTimes = [];

async function receive(contract) {
  const filter = contract.filters.newAccess();

  contract.on(filter, (setter, event) => {
    receivedTimes.push(Date.now());

    console.log("Received: Request n. " + (receivedTimes.length));
  });
}

async function send(contract, httpProvider) {
  for(let index = 0; index < REQUESTS; index++) {
    console.log("Sent: Request n. " + (sentTimes.length + 1));

    const transaction = await contract.accessDoor({ gasLimit: MAX_GAS_FEE, gasPrice: GAS_PRICE });

    sentTimes.push(Date.now());

    await transaction.wait();
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
  await send(contract_send, httpProvider);
  await poll();

  results = [];

  for(let index = 0; index < sentTimes.length; index++) {
    const time = (receivedTimes[index] - sentTimes[index]) / 1000;
    results.push(time);

    console.log("Elapsed time for Request n. " + (index + 1) + ": " + time + " seconds");
  }

  averageTime = getAverage(results).toFixed(3);
  console.log("Average time: " + averageTime + " seconds")
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

  