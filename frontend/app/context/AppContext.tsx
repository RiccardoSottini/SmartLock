"use client";

import React, { createContext, useEffect, useState } from "react";
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from "web3";

export const formatBalance = (rawBalance: string) => {
  return web3_scan.utils.fromWei(rawBalance, 'ether');
}

const NODE_URL = "https://rough-solitary-gas.matic-testnet.discover.quiknode.pro/95a66b31d01626a4af842562f3d780388e4e97e9/";
const web3 = new Web3(window.ethereum);
const web3_scan = new Web3(NODE_URL);

const contractABI = [ { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" } ], "name": "newAccess", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "user", "type": "address" } ], "name": "newTicket", "type": "event" }, { "inputs": [], "name": "access", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "buy", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "reset", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "getAccesses", "outputs": [ { "components": [ { "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "internalType": "address", "name": "user", "type": "address" } ], "internalType": "struct SmartDoor.Access[]", "name": "", "type": "tuple[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "hasTicket", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" } ];
const contractAddress = '0x10A66C344FEcC69CE6D34b1E5Bd1beA3C6215cA7';

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)

  const initialState = { accounts: [], balance: "" }
  const [wallet, setWallet] = useState(initialState)

  const [ticket, setTicket] = useState(false);
  const [accesses, setAccesses] = useState([]);

  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(false)        
  const [errorMessage, setErrorMessage] = useState("")  

  useEffect(() => {
    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true });

      if (provider) {
        const accounts = await window.ethereum.request(
          { method: 'eth_accounts' }
        );

        refreshAccounts(accounts);
        window.ethereum.on('accountsChanged', refreshAccounts);
      } else {
        finishLoading();
      }
    }

    getProvider();

    return () => {
      window.ethereum?.removeListener('accountsChanged', refreshAccounts);
    }
  }, []);

  const finishLoading = () => {
    setTimeout(() => setIsLoading(false), 1000);
  }

  const refreshAccounts = async (accounts: any) => {
    if (accounts.length > 0) {
      updateWallet(accounts);
    } else {
      setWallet(initialState);
    }

    await getTicket(accounts);
    await getAccesses(accounts);
    finishLoading();
  }

  const updateWallet = async (accounts: any) => {
    const balance = formatBalance(await web3_scan.eth.getBalance(accounts[0], 'latest'));

    setWallet({ accounts, balance });
  }

  const handleConnect = async () => {                  
    setIsConnecting(true);    

    await window.ethereum.request({                    
      method: "eth_requestAccounts"
    }).then((accounts:[]) => {                            
      setError(false)                                   
      refreshAccounts(accounts)                           
    }).catch((err:any) => {                               
      setError(true)                                    
      setErrorMessage(err.message)                      
    });                            

    setIsConnecting(false);                             
  }

  const disableConnect = Boolean(wallet) && isConnecting;

  const buyTicket = async () => {
    const chainId = await web3.eth.getChainId();

    if(chainId == 80001) {
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      await contract.methods.buy().send({
        from: wallet.accounts[0],
        value: "0x16345785D8A0000", //0.1 ether in hexadecimal
        gas: web3.utils.toHex(500000)
      });

      refreshAccounts(wallet.accounts);
    } else {
      setError(true);
      setErrorMessage("Change network to buy the ticket");
    }
  }

  const openDoor = async () => {
    const chainId = await web3.eth.getChainId();

    if(chainId == 80001) {
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      await contract.methods.access().send({
        from: wallet.accounts[0],
        value: web3.utils.toHex(0),
        gas: web3.utils.toHex(5000000)
      });

      refreshAccounts(wallet.accounts);
    } else {
      setError(true);
      setErrorMessage("Change network to open the door");
    }
  }

  const getTicket = async (accounts: any) => {
    const contract = new web3_scan.eth.Contract(contractABI, contractAddress);

    let ticket = await contract.methods.hasTicket().call({
      from: accounts[0]
    });

    await setTicket(ticket);
  }

  const getAccesses = async (accounts: any) => {
    const contract = new web3_scan.eth.Contract(contractABI, contractAddress);

    let accesses = [...(await contract.methods.getAccesses().call({
      from: accounts[0]
    }))].reverse();

    await setAccesses(accesses);
  }

  return (
    <AppContext.Provider
      value={{ isLoading, wallet, error, setError, errorMessage, handleConnect, disableConnect, accesses, buyTicket, ticket, openDoor }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;