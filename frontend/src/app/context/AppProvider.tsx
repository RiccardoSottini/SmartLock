"use client";

import React, {
  createContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { MetaMaskInpageProvider } from "@metamask/providers";
import Web3 from "web3";
import config from "../includes/config.json" assert { type: "json" };

/* Setup TypeScript to expect MetaMask provider */
declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

/* Configuration variables (from includes/config.json file) */
const CONTRACT_ADDRESS = config.contract_address;
const CONTRACT_ABI = config.contract_abi;
const WEB3_PROVIDER = config.provider_endpoint;

/* Blockchain related configuration constants */
export const MAX_GAS_FEE = 10000000;
export const GAS_PRICE = 10000000015;
export const CHAIN_ID: bigint = BigInt(80002);

/* Status enumeration (NULL / PENDING / ACCEPTED / REJECTED) */
export enum Status {
  NULL = 0,
  PENDING = 1,
  ACCEPTED = 2,
  REJECTED = 3,
}

/* User Role enumeration (NULL / OWNER / GUEST) */
export enum Role {
  NULL = 0,
  OWNER = 1,
  GUEST = 2,
}

/* Authorisation data structure (timestamp, guest, name, status) */
export type Authorisation = {
  timestamp: string;
  guest: string;
  name: string;
  status: Status;
};

/* Access data structure (timestamp, guest) */
export type AccessType = {
  timestamp: string;
  guest: string;
};

/* Blockchain web3 and contract instances */
export type Blockchain = {
  web3_send: any;
  web3_fetch: any;
  contract_send: any;
  contract_fetch: any;
};

/* Wallet data structure (account, balance) */
export type Wallet = {
  account: string;
  balance: string;
};

/* Data structure definition returned by the Context */
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
  checkChain: (chainId: bigint) => boolean;
};

/* Setup initial values of the Context */
export const AppContext = createContext<AppContextType>({
  isLoading: true,
  isConnected: false,
  isConnecting: false,
  error: false,
  errorMessage: "",
  setError: () => {},
  setErrorMessage: () => {},
  blockchain: {
    web3_send: null,
    web3_fetch: null,
    contract_send: null,
    contract_fetch: null,
  },
  wallet: { account: "", balance: "" },
  role: Role.NULL,
  connectWallet: () => {},
  refreshWallet: () => {},
  checkChain: (chainId: bigint) => true,
});

/* Props for the AppProvider */
interface AppProviderProps {
  children: React.ReactNode;
}

/* AppProvider Context definition */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  /* Context variables definition */
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isConnected, setConnected] = useState<boolean>(false);
  const [isConnecting, setConnecting] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [blockchain, setBlockchain] = useState<Blockchain>({
    web3_send: null,
    web3_fetch: null,
    contract_send: null,
    contract_fetch: null,
  });
  const [wallet, setWallet] = useState<Wallet>({ account: "", balance: "" });
  const [role, setRole] = useState<Role>(Role.NULL);

  /* React Hook ran when Context is loaded */
  useEffect(() => {
    /* Call the function to setup the blockchain instances */
    setupBlockchain();
  }, []);

  /* React Hook ran when blockchain instances are updated */
  useEffect(() => {
    /* Check if the blockchain instances are defined */
    if (blockchain.web3_send != null && blockchain.web3_fetch != null) {
      /* Call the function to setup the blockchain provider */
      setupProvider();

      /* After React Hook is completed, remove the listener */
      return () => {
        window.ethereum?.removeListener("accountsChanged", updateAccounts);
      };
    }
  }, [blockchain]);

  /* React Hook ran when the wallet connection is completed */
  useEffect(() => {
    /* Check if the wallet connection is completed */
    if (isConnected) {
      /* Call the function to refresh information about the wallet */
      refreshWallet();
    }
  }, [isConnected]);

  /* Function used to setup the blockchain instances */
  const setupBlockchain = async () => {
    /* Initiate the web3 instances (send and fetch) */
    const web3_send = new Web3(window.ethereum);
    const web3_fetch = new Web3(WEB3_PROVIDER);

    /* Set the value for the blockchain instances */
    setBlockchain({
      web3_send: web3_send,
      web3_fetch: web3_fetch,
      contract_send: new web3_send.eth.Contract(
        CONTRACT_ABI, 
        CONTRACT_ADDRESS
      ),
      contract_fetch: new web3_fetch.eth.Contract(
        CONTRACT_ABI,
        CONTRACT_ADDRESS
      ),
    });
  };

  /* Function used to setup the blockchain provider */
  const setupProvider = async () => {
    /* Retrieve if the ethereum provider exists */
    const provider = await detectEthereumProvider({ silent: true });

    /* Check if the ethereum provider exists */
    if (provider) {
      /* Retrieve the accounts managed by the wallet */
      const accounts = await window.ethereum?.request({
        method: "eth_accounts",
      });

      /* Call the function to update the information about the accounts */
      updateAccounts(accounts);

      /* Setup the event listener capturing when the account is changed */
      window.ethereum?.on("accountsChanged", updateAccounts);
    }
  };

  /* Function used to get the data stored about the wallet's accounts */
  const updateAccounts = async (accounts: any) => {
    /* Check if the list of accounts is not empty */
    if (accounts.length > 0) {
      /* Update the information about the wallet */ 
      updateWallet(accounts[0]);
    } else {
      /* Set the information of the wallet to be empty and that the connection is not completed */
      setWallet({ account: "", balance: "" });
      setConnected(false);
    }

    /* End the loading phase after 1 second */
    setTimeout(() => setLoading(false), 1000);
  };

  /* Function used to get data about the wallet */
  const updateWallet = async (account: any) => {
    /* Retrieve and format the balance of the account */
    const balance = formatBalance(
      await blockchain.web3_fetch.eth.getBalance(account, "latest")
    );

    /* Call the function to retrieve the role of the account address */
    getRole(account);

    /* Set the information of the wallet with the retrieved data */
    setWallet({
      account: account,
      balance: Number.parseFloat(balance).toFixed(6),
    });
  };

  /* Function used to refresh data about the wallet */
  const refreshWallet = () => {
    /* Check if the wallet is set */
    if (wallet) {
      /* Update the wallet information every 5 seconds */
      setInterval(() => {
        updateWallet(wallet.account);
      }, 5000);
    }
  };

  /* Function used to connect to the wallet */
  const connectWallet = async () => {
    /* Set that the connection is initiated */
    setConnecting(true);

    /* Retrieve the list of accounts - manage success and error */
    await window.ethereum
      ?.request({
        method: "eth_requestAccounts",
      })
      .then((accounts: any) => {
        setError(false);
        updateAccounts(accounts);
      })
      .catch((err: any) => {
        setError(true);
        setErrorMessage(err.message);
      });

    /* Set that the connection is terminated */
    setConnecting(false);
  };

  /* Function used to get the user Role */
  const getRole = async (account: any) => {
    /* Call the contract method to retrieve the user role */
    let result: Role = await blockchain.contract_fetch.methods.getRole().call({
      from: account,
    });

    /* Set the role to be the value retrieved */
    setRole(result);

    /* Set that the connection is completed */
    setConnected(true);
  };

  /* Function used to format the balance of the wallet */
  const formatBalance = (rawBalance: bigint) => {
    /* Format the balance by converting the raw balance from WEI into ETHER */
    return blockchain.web3_fetch.utils.fromWei(rawBalance, "ether");
  };

  /* Function used to check the chain id of the network the wallet is connected to */
  const checkChain = (chainId: bigint) => {
    /* Check if the chain ids are the same */
    return chainId == CHAIN_ID;
  };

  /* Setup return value of the Context */
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
    refreshWallet,
    checkChain,
  };

  /* Return the Context value */
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
