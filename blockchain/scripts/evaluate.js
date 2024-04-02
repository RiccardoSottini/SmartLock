const CONTRACT_ADDRESS = "0x3A9bE092739cc2511BEDf088Fab97044AD98b8aB";
const REQUESTS = 25;
const TIMEOUT = 5000;
let receivedTimes = [], sentTimes = [];

async function receive(contract) {
  const filter = contract.filters.newAccess();

  contract.on(filter, (setter, event) => {
    receivedTimes.push(Date.now());

    console.log("Received: Request n. " + (receivedTimes.length));
  });
}

async function send(contract) {
  for(let index = 0; index < REQUESTS; index++) {
    console.log("Sent: Request n. " + (sentTimes.length + 1));

    await contract.accessDoor();

    sentTimes.push(Date.now());

    await timer(TIMEOUT);
  }
}

async function poll() {
  while(sentTimes.length < REQUESTS || receivedTimes.length < REQUESTS) {
    await timer(100);
  }
}

async function main() {
  const SmartDoor = await ethers.getContractFactory("SmartDoor");
  const contract = await SmartDoor.attach(CONTRACT_ADDRESS);

  await receive(contract);
  await send(contract);
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

  