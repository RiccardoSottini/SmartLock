"use client"

import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppContext } from "./AppProvider";

export enum Status {
  NULL = 0,
  PENDING = 1, 
  ACCEPTED = 2, 
  REJECTED = 3
}

export type Authorisation = {
  timestamp: string;
  guest: string;
  status: Status;
}

export type GuestContextType = {
  authorisation: Authorisation;
  requestAuthorisation: () => void;
};

export const GuestContext = createContext<Partial<GuestContextType>>({});

interface GuestProviderProps {
  children: React.ReactNode;
}

export const GuestProvider: React.FC<GuestProviderProps> = ({ children }) => {  
  const { isConnected, blockchain, wallet, refreshWallet } = useContext(AppContext);

  const [authorisation, setAuthorisation] = useState<Authorisation>({timestamp: "", guest: "", status: Status.NULL});

  useEffect(() => {
    if(isConnected) {
      listenPendingAuthorisation();
      listenAcceptedAuthorisation();
      listenReset();

      refresh();
    }
  }, [isConnected]);

  const refresh = async () => {
    if(refreshWallet) {
      refreshWallet();
    }

    getAuthorisation();
  }

  const getAuthorisation = async () => {
    let result : Authorisation = await blockchain?.contract_fetch.methods.getAuthorisation().call({
      from: wallet?.account
    });

    setAuthorisation({
      timestamp: result.timestamp,
      guest: result.guest,
      status: Number(result.status) as Status
    } as Authorisation);
  }

  const requestAuthorisation = async () => {
    const chainId : bigint = await blockchain?.web3_send.eth.getChainId();

    if(chainId == BigInt(80001)) {
      blockchain?.contract_send.methods.requestAuthorisation().send({
        from: wallet?.account,
        gas: blockchain?.web3_send.utils.toHex(5000000)
      });
    } else {
      //setError(true);
      //setErrorMessage("Change network to request the authorisation");
    }
  }

  const listenPendingAuthorisation = async () => {
    blockchain?.contract_fetch.events.pendingAuthorisation().on("data", (event : any) => {
      console.log("event pending authorisation");
      refresh();
    });
  }

  const listenAcceptedAuthorisation = async () => {
    blockchain?.contract_fetch.events.acceptedAuthorisation().on("data", (event : any) => {
      console.log("event accepted authorisation");
      refresh();
    });
  }

  const listenReset = async () => {
    blockchain?.contract_fetch.events.newReset().on("data", (event : any) => {
      console.log("event reset");
      refresh();
    });
  }

  const contextValue: GuestContextType = {
    authorisation,
    requestAuthorisation,
  };

  return (
    <GuestContext.Provider value={contextValue}>
      {children}
    </GuestContext.Provider>
  );
};