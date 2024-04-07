/* Import configuration file */
const config = require("../includes/config.json");

/* Setup configuration constants */
const PRIVATE_KEY = config.private_key;
const CONTRACT_ADDRESS = config.contract_address;
const CONTRACT_ABI = config.contract_abi;
const HTTP_PROVIDER = config.provider_endpoint_send;
const WSS_PROVIDER = config.provider_endpoint_fetch;

/* Setup program constants (requests per method / maximum gas fee / gas price) */
const REQUESTS = 25;
const MAX_GAS_FEE = 10000000;
const GAS_PRICE = ethers.utils.parseUnits("10", "gwei");

/* Utility function - used to suspend thread execution for ms milliseconds */
const timer = (ms) => new Promise((res) => setTimeout(res, ms));

/* Utility function - used to calculate the average of an array */
const getAverage = (array) =>
  array.reduce((sum, currentValue) => sum + currentValue, 0) / array.length;

/* List of timestamp of when a method has been called and an event is retrieved */
let receivedTimes = [], sentTimes = [];

/* Function used to setup the event listener receiving emitted events from the contract */
async function receive(contract) {
  /* Setup the filter to retrieve the newAccess events */
  const filter = contract.filters.newAccess();

  /* Setup event listener linking it to the contract */
  contract.on(filter, (setter, event) => {
    /* Insert timestamp in the list of when the events are received */
    receivedTimes.push(Date.now());

    /* Print that the event connected to the request has been received */
    console.log("Received: Request n. " + receivedTimes.length);
  });
}

/* Function used to call the accessDoor contract method */
async function send(contract) {
  /* Loop that sends a certain number of calls to the accessDoor contract method */
  for (let index = 0; index < REQUESTS; index++) {
    /* Print that the request has been sent */
    console.log("Sent: Request n. " + (sentTimes.length + 1));

    /* Setup a transaction calling the accessDoor contract method */
    const transaction = await contract.accessDoor({
      gasLimit: MAX_GAS_FEE,
      gasPrice: GAS_PRICE,
    });

    /* Insert timestamp of when the call has been initiated */
    sentTimes.push(Date.now());

    /* Wait for the transaction to be confirmed */
    await transaction.wait();
  }
}

/* Function used to wait for the lists of timestamps to be filled */
async function poll() {
  /* Loop until the size of the lists of timestamps are not filled yet */
  while (sentTimes.length < REQUESTS || receivedTimes.length < REQUESTS) {
    /* Wait for 10 milliseconds */
    await timer(10);
  }
}

/* Main function - entry point of the program */
async function main() {
  /* Setup the instance that replicates a blockchain wallet, by inserting the private key */
  const wallet = new ethers.Wallet(PRIVATE_KEY);

  /* Setup the provider and signer using the blockchain provider http url */
  const httpProvider = new ethers.providers.JsonRpcProvider(HTTP_PROVIDER);
  const httpSigner = wallet.connect(httpProvider);

  /* Setup the provider and signer using the blockchain provider websocket url */
  const wssProvider = new ethers.providers.WebSocketProvider(WSS_PROVIDER);
  const wssSigner = wssProvider.getSigner();

  /* Setup the contract instance to send method calls altering data */
  const contract_send = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    httpSigner
  );

  /* Setup the contract instance used to fetch data */
  const contract_fetch = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    wssSigner
  );

  /* Call the function to setup the event listener */
  await receive(contract_fetch);
  
  /* Call the function to send the calls to the accessDoor contract method */
  await send(contract_send);

  /* Call the function to wait until the lists of timestamps are filled */
  await poll();

  /* Setup list with the results */
  results = [];

  /* Loop through the list of timestamps */
  for (let index = 0; index < sentTimes.length; index++) {
    /* Calculate the elapsed time in seconds and insert it in the list of the results */
    const time = (receivedTimes[index] - sentTimes[index]) / 1000;
    results.push(time);

    /* Print the elapsed time for the request */
    console.log(
      "Elapsed time for Request n. " + (index + 1) + ": " + time + " seconds"
    );
  }

  /* Calculate the average time and print it */
  averageTime = getAverage(results).toFixed(3);
  console.log("Average time: " + averageTime + " seconds");
}

/* Setup the program execution - useful for HardHat */
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
