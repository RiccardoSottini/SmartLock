/* Import configuration file */
const config = require("../includes/config.json");

/* Setup configuration constants */
const USER_ADDRESS = config.user_address;
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

/* List of timestamp of when a method has been called and an event is retrieved */
let receivedTimes = [], sentTimes = [];

/* Function used to setup the event listener receiving emitted events from the contract */
async function receive(contract) {
  /* Setup the filter to retrieve the updateOwner events */
  const filter = contract.filters.updateOwner();

  /* Setup event listener linking it to the contract */
  contract.on(filter, (setter, event) => {
    /* Insert timestamp in the list of when the events are received */
    receivedTimes.push(Date.now());
  });
}

/* Function used to call the contract method */
async function send(contract, method_name, method_type, method_args) {
  /* Loop that sends a certain number of calls to the contract method */
  for (let index = 0; index < REQUESTS; index++) {
    /* Check the type of the contract method */
    if (method_type == "payable") {
      /* Setup a transaction calling the contract method */
      const transaction = await contract[method_name](...method_args, {
        gasLimit: MAX_GAS_FEE,
        gasPrice: GAS_PRICE,
      });

      /* Insert timestamp of when the call has been initiated */
      sentTimes.push(Date.now());

      /* Wait for the transaction to be confirmed */
      await transaction.wait();
    } else if (method_type == "view") {
      /* Insert timestamp of when the call has been initiated */
      sentTimes.push(Date.now());

      /* Call the contract method to fetch data and wait for data to be returned */
      await contract[method_name](...method_args);

      /* Insert timestamp in the list of when data is returned by the contract call */
      receivedTimes.push(Date.now());
    }
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

  /* Setup lists with the results */
  let payableResults = [], viewResults = [];
  let results = [];

  /* Print the header of the program */
  console.log("Evaluation based on " + REQUESTS + " calls for each method");

  /* Loop through the list of methods */
  for (let methodIndex = 0; methodIndex < methods.length; methodIndex++) {
    /* Call the function to send the calls to the contract method */
    await send(
      contract_send,
      methods[methodIndex].name,
      methods[methodIndex].type,
      methods[methodIndex].args
    );

    /* Call the function to wait until the lists of timestamps are filled */
    await poll();

    /* Setup the list with the differences between timestamps (representing the elapsed time) */
    let differences = [];

    /* Loop through the timestamps */
    for (let index = 0; index < sentTimes.length; index++) {
      /* Calculate the elapsed time and insert it in the list of the differences */
      differences.push((receivedTimes[index] - sentTimes[index]) / 1000);
    }

    /* Calculate the average - minimum - maximum elapsed time */
    const average = getAverage(differences);
    const minimum = Math.min(...differences);
    const maximum = Math.max(...differences);

    /* Insert the average time in the list of results to calculate the average elapsed time */
    results.push(average);

    /* Check the method type */
    if (methods[methodIndex].type == "payable") {
      /* Insert the averae time in the list of results to calculate the average elapsed time for sending data */
      payableResults.push(average);
    } else if (methods[methodIndex].type == "fetch") {
      /* Insert the averae time in the list of results to calculate the average elapsed time for fetching data */
      viewResults.push(average);
    }

    /* Print minimum - average - maximum elapsed time for the method call */
    console.log(
      "Minimum - Average - Maximum time for '" +
        methods[methodIndex].name +
        "': " +
        minimum.toFixed(3) +
        " - " +
        +average.toFixed(3) +
        " - " +
        +maximum.toFixed(3)
    );

    /* Reset the list of timestamps */
    receivedTimes = [];
    sentTimes = [];
  }

  /* Print the average time sending data / fetching data / all methods */
  console.log("");
  console.log(
    "Average time for payable methods: " + getAverage(payableResults).toFixed(3)
  );
  console.log(
    "Average time for view methods: " + getAverage(viewResults).toFixed(3)
  );
  console.log(
    "Average time for all methods: " + getAverage(results).toFixed(3)
  );
}

/* Setup the program execution - useful for HardHat */
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
