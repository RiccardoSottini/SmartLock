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

const CONTRACT_ADDRESS = "0x2d8380dE65602261BFCD9Fa17eB8Bf2F3fcdA8d4";
const CONTRACT_ABI = require("../includes/contract_abi.json");
const WEB3_PROVIDER = "wss://rough-solitary-gas.matic-testnet.quiknode.pro/95a66b31d01626a4af842562f3d780388e4e97e9/"

export const GAS_FEE = 5000000;

export enum Status {
  NULL = 0,
  PENDING = 1, 
  ACCEPTED = 2, 
  REJECTED = 3
}

export type Authorisation = {
  timestamp: string;
  guest: string;
  name: string;
  status: Status;
}

export type AccessType = {
  timestamp: string;
  guest: string;
}

export type Blockchain = {
  web3_send: any;
  web3_fetch: any;
  contract_send: any;
  contract_fetch: any;
}

export type Wallet = {
  account: string;
  balance: string;
};

export enum Role {
  NULL = 0,
  OWNER = 1,
  GUEST = 2
}

export type AppContextType = {
  isLoading: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  error: boolean;
  errorMessage: string;
  setError: Dispatch<SetStateAction<boolean>>;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  
  blockchain: Blockchain;
  wallet: Wallet;
  role: Role;
  connectWallet: () => void;
  refreshWallet: () => void;
};

export const AppContext = createContext<AppContextType>({
  isLoading: true,
  isConnected: false,
  isConnecting: false,
  error: false,
  errorMessage: "",
  setError: () => {},
  setErrorMessage: () => {},
  blockchain: { web3_send: null, web3_fetch: null, contract_send: null, contract_fetch: null },
  wallet: { account: "", balance: "" },
  role: Role.NULL,
  connectWallet: () => {},
  refreshWallet: () => {}
});

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isConnected, setConnected] = useState<boolean>(false);
  const [isConnecting, setConnecting] = useState<boolean>(false);

  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");  

  const [blockchain, setBlockchain] = useState<Blockchain>({ web3_send: null, web3_fetch: null, contract_send: null, contract_fetch: null });
  const [wallet, setWallet] = useState<Wallet>({ account: "", balance: "" });
  const [role, setRole] = useState<Role>(Role.NULL);

  useEffect(() => {
    setupBlockchain();
  }, []);

  useEffect(() => {
    if(blockchain.web3_send != null && blockchain.web3_fetch != null) {
      setupProvider();

      return () => {
        window.ethereum?.removeListener('accountsChanged', updateAccounts);
      }
    }
  }, [blockchain]);

  useEffect(() => {
    if(isConnected) {
      refreshWallet();
    }
  }, [isConnected]);

  const setupBlockchain = async () => {
    const web3_send = new Web3(window.ethereum);
    const web3_fetch = new Web3(WEB3_PROVIDER);

    setBlockchain({
      web3_send: web3_send,
      web3_fetch: web3_fetch, 
      contract_send: new web3_send.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS),
      contract_fetch: new web3_fetch.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS)
    });
  }

  const setupProvider = async () => {
    const provider = await detectEthereumProvider({ silent: true });

    if (provider) {
      const accounts = await window.ethereum?.request({ method: 'eth_accounts' });
      updateAccounts(accounts);

      window.ethereum?.on('accountsChanged', updateAccounts);
    }
  }

  const updateAccounts = async (accounts: any) => {
    if (accounts.length > 0) {
      updateWallet(accounts[0]);
    } else {
      setWallet({ account: "", balance: "" });
      setConnected(false);
    }

    setTimeout(() => setLoading(false), 1000);
  }

  const updateWallet = async (account: any) => {
    const balance = formatBalance(await blockchain.web3_fetch.eth.getBalance(account, 'latest'));

    getRole(account);
    setWallet({ account: account, balance: balance });
  }

  const refreshWallet = () => {
    if(wallet) {
      setInterval(() => {
        updateWallet(wallet.account);
      }, 5000);
    }
  }

  const connectWallet = async () => {                  
    setConnecting(true); 

    await window.ethereum?.request({                    
      method: "eth_requestAccounts"
    }).then((accounts : any) => {                        
      setError(false);                                   
      updateAccounts(accounts);                           
    }).catch((err : any) => {                              
      setError(true);                                    
      setErrorMessage(err.message);                      
    });    

    setConnecting(false); 
  }

  const getRole = async (account: any) => {
    let result : Role = await blockchain.contract_fetch.methods.getRole().call({
      from: account
    });

    setRole(result);
    setConnected(true);
  }

  const formatBalance = (rawBalance: bigint) => {
    return blockchain.web3_fetch.utils.fromWei(rawBalance, 'ether');
  }

  const contextValue: AppContextType = {
    isLoading,
    isConnected,
    isConnecting,
    error,
    errorMessage,
    setError,
    setErrorMessage,

    blockchain,
    wallet,
    role,
    connectWallet,
    refreshWallet
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};