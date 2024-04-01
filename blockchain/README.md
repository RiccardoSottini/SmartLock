# Process to deploy the contract on the Polygon network

## Step 1: Setup Node & Install Hardhat + useful libraries
Install Hardhat, which is a package helping developers to automate the deployment of a smart contract on the blockchain network.  
The installation can be done with the following commands:
```
npm init --y
npm install --save-dev hardhat
npm install --save-dev @nomiclabs/hardhat-ethers ethers @nomiclabs/hardhat-waffle ethereum-waffle chai
```

## Step 2: Configuration of Hardhat
In order to deploy a contract Hardhat needs to have the url of the endpoint, along with the private key of the used account (which can be retrieved through MetaMask).  
Once the variables are retrieved, they can be securily stored by hardhat by typing them in the terminal.  
The following commands help in doing that:
```
npx hardhat vars set ENDPOINT_URL
npx hardhat vars set PRIVATE_KEY
```

## Step 3: Compile the contract
Hardhat produces the bytecode of the smart contract, along with its ABI and stores locally.  
The following is the command used in doing so:
```
npx hardhat compile
```

## Step 4: Deploy on the blockchain network
Once the configuration and compilation of the contract is completed, it can be deployed remotely.  
As the contract is deployed, the terminal will show to which address it has been published.   
It can be done by typing the following command:
```
npx hardhat run scripts/deploy.js --network amoy
```

## Step 5: Run evaluation script
The script is used for evaluating the transaction confirmation time based on the gas fee price set.
Setting up the evaluation and running the script is done with the following commands:
```
npx hardhat vars set CONTRACT_ADDRESS
npx hardhat run scripts/evaluate.js --network amoy
```