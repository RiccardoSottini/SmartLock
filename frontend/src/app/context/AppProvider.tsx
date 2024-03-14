"use client"

import React, { createContext, useState, useEffect, Dispatch, SetStateAction} from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { MetaMaskInpageProvider } from '@metamask/providers';
import Web3 from "web3";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

const CONTRACT_ADDRESS = "0xfF64D10D2a0a66629f1EC602A6137Ef76C778063"
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"guest","type":"address"}],"name":"acceptedAuthorisation","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"guest","type":"address"}],"name":"newAccess","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"guest","type":"address"}],"name":"pendingAuthorisation","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"guest","type":"address"}],"name":"rejectedAuthorisation","type":"event"},{"inputs":[],"name":"accessDoor","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getAccesses","outputs":[{"components":[{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"address","name":"guest","type":"address"}],"internalType":"struct SmartDoor.Access[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAuthorisation","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRole","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"requestAuthorisation","outputs":[],"stateMutability":"payable","type":"function"}];
const WEB3_PROVIDER = "https://rough-solitary-gas.matic-testnet.discover.quiknode.pro/95a66b31d01626a4af842562f3d780388e4e97e9/"

const web3_scan = new Web3(WEB3_PROVIDER);

if(typeof window != "undefined" && typeof window.ethereum != "undefined") {
  const web3 = new Web3(window.ethereum);
}

export type WalletType = {
  accounts: any[];
  balance: string;
};

export enum Role {
  NULL = "NULL",
  OWNER = "OWNER", 
  GUEST = "GUEST"
}

export enum Authorisation {
  NULL = "NULL",
  PENDING = "PENDING", 
  ACCEPTED = "ACCEPTED", 
  REJECTED = "REJECTED"
}

export type AppContextType = {
  handleConnect: () => void;
  isConnected: boolean;
  isLoading: boolean;
  isConnecting: boolean;
  wallet: WalletType;
  role: Role;
  authorisation: Authorisation;
  requestAuthorisation: () => void;
  error: boolean;
  errorMessage: string;
  setError: Dispatch<SetStateAction<boolean>>;
  setErrorMessage: Dispatch<SetStateAction<string>>;
};

export const AppContext = createContext<Partial<AppContextType>>({});

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isConnected, setConnected] = useState<boolean>(false);
  
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isConnecting, setConnecting] = useState<boolean>(false);

  const [wallet, setWallet] = useState<WalletType>({ accounts: [], balance: '' });
  const [role, setRole] = useState<Role>(Role.NULL);
  const [authorisation, setAuthorisation] = useState<Authorisation>(Authorisation.NULL);
  
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");  

  useEffect(() => {
    getProvider();

    return () => {
      window.ethereum?.removeListener('accountsChanged', refreshAccounts);
    }
  }, []);

  useEffect(() => {
    if(role != Role.NULL) {
      setConnected(true);

      getAuthorisation(wallet.accounts);
    }
  }, [role]);

  useEffect(() => {
    console.log(authorisation);

    finishLoading();
  }, [authorisation]);

  const getProvider = async () => {
    const provider = await detectEthereumProvider({ silent: true });

    if (provider) {
      const accounts = await window.ethereum?.request(
        { method: 'eth_accounts' }
      );

      refreshAccounts(accounts);
      window.ethereum?.on('accountsChanged', refreshAccounts);
    } else {
      finishLoading();
    }
  }

  const refreshAccounts = async (accounts: any) => {
    if (accounts.length > 0) {
      updateWallet(accounts);
    } else {
      setWallet({accounts: [], balance: ""});
    }

    getRole(accounts);
  }

  const finishLoading = () => {
    setTimeout(() => setLoading(false), 1000);
  }

  const updateWallet = async (accounts: any) => {
    const balance = formatBalance(await web3_scan.eth.getBalance(accounts[0], 'latest'));

    setWallet({ accounts : accounts, balance: balance });
  }

  const formatBalance = (rawBalance: bigint) => {
    return web3_scan.utils.fromWei(rawBalance, 'ether');
  }

  const handleConnect = async () => {                  
    setConnecting(true); 

    await window.ethereum?.request({                    
      method: "eth_requestAccounts"
    }).then((accounts: any) => {                        
      setError(false)                                   
      refreshAccounts(accounts)                           
    }).catch((err:any) => {                              
      setError(true)                                    
      setErrorMessage(err.message)                      
    });    

    setConnecting(true); 
  }

  const getRole = async (accounts: any) => {
    const contract = new web3_scan.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    let result : Role = await contract.methods.getRole().call({
      from: accounts[0]
    });

    setRole(result);
  }

  const getAuthorisation = async (accounts: any) => {
    const contract = new web3_scan.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    let result : Authorisation = await contract.methods.getAuthorisation().call({
      from: accounts[0]
    });

    setAuthorisation(result);
  }

  const requestAuthorisation = async () => {
    const chainId : bigint = await web3.eth.getChainId();

    if(chainId == BigInt(80001)) {
      const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

      await contract.methods.requestAuthorisation().send({
        from: wallet.accounts[0],
        gas: web3.utils.toHex(5000000)
      });

      refreshAccounts(wallet.accounts);
    } else {
      setError(true);
      setErrorMessage("Change network to request the authorisation");
    }
  }

  const contextValue: AppContextType = {
    handleConnect,
    isConnected,
    isLoading,
    isConnecting,
    wallet,
    role,
    authorisation,
    requestAuthorisation,
    error,
    errorMessage,
    setError,
    setErrorMessage
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};