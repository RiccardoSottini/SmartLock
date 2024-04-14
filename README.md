# Smart Lock: A Cyber-Physical System operated by a Smart Contract
Final Year Project (FYP 2023-2024)  
Riccardo Sottini  
Aston University  

# Configure the system components
The following are the steps to configure the system components.

## 1. Setup & Configure the Blockchain environment
### 1.1 Setup Node & Install Hardhat + useful libraries
Install Hardhat, a package helping developers to automate the deployment of a smart contract on the blockchain network.
```
npm init --y
npm install --save-dev hardhat
npm install --save-dev @nomiclabs/hardhat-ethers ethers @nomiclabs/hardhat-waffle ethereum-waffle chai
```

### 1.2 Configure Hardhat
To deploy a contract, Hardhat needs to have the url of the endpoint, along with the private key of the used account (which can be retrieved through MetaMask).  
Once the variables are retrieved, they can be stored by hardhat by typing them in the terminal.  
```
npx hardhat vars set ENDPOINT_URL
npx hardhat vars set PRIVATE_KEY
```


## 2. Compile & Deploy Smart Contract  
### 2.1 Compile the contract
Hardhat produces the bytecode of the smart contract, along with its ABI and stores them locally.  
```
npx hardhat compile
```

### 2.2 Deploy on the Polygon blockchain network
Once the configuration and compilation of the contract is completed, it can be deployed remotely.  
As the contract is deployed, the terminal will show to which address it has been published.   
```
npx hardhat run scripts/deploy.js --network amoy
```


## 3. Configure Door Script
### 3.1 Install the libraries for the Python script
Install the version 3.7 of Python.
The following command is used to install the useful libraries (Web3, RPi.GPIO, asyncio)
```
pip install web3 RPi.GPIO asyncio
```

### 3.2 Setup the configuration file: door/config.json
Retrieve the deployed contract address and ABI, and retrieve the HTTPS blockchain gateway endpoint.  
Set the environment variables in the configuration file:  
```
provider_endpoint = HTTPS endpoint api url  
contract_address = Deployed contract address  
contract_abi = Deployed contract ABI definition  
```


## 4. Configure Frontend
### 4.1 Install the libraries for the Next.js project
Use the following command to install the libraries used by the project:
```
npm install
```

### 4.2 Setup the configuration file: frontend/src/app/includes/config.json
Retrieve the deployed contract address and ABI, and retrieve the WSS blockchain gateway endpoint.  
Set the environment variables in the configuration file:  
```
provider_endpoint = WSS endpoint api url  
contract_address = Deployed contract address  
contract_abi = Deployed contract ABI definition  
```


# Run the system
To run the entire system, there is the need to:
- run the frontend on the server
- run the door script on the Raspberry Pi microcontroller

## Run Frontend
The frontend can either be run in the dev environment (during the development phase), or compile it and run it in the production environment.  
The development environment can be run with this command:  
```
npm run dev
```  
  The production environment can be run with these commands:  
```
npm run build
npm start
```

## Run Door Script
The script needs to be run on the Raspberry Pi microcontroller with internet connection.
The following command is used to run the script:
```
python script.py
```


# Evaluate Smart Contract
Various scripts were developed for evaluating the time performance and estimated gas fees for the contract methods.
The scripts need to be configured by setting up the following configuration variables in includes/config.json:
- user_address
- private_key
- provider_endpoint_send
- provider_endpoint_fetch
- contract_address
- contract_abi

The evaluation scripts can be run with the following commands:
```
npx hardhat run scripts/evaluate_access.js --network amoy
npx hardhat run scripts/evaluate_methods.js --network amoy
npx hardhat run scripts/estimate_gas.js --network amoy
```