"use client"

import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppContext, Authorisation, Status } from "./AppProvider";

export type GuestContextType = {
  authorisation: Authorisation;
  requestAuthorisation: () => void;
};

export const GuestContext = createContext<GuestContextType>({
  authorisation: { timestamp: "", guest: "", status: Status.NULL },
  requestAuthorisation: () => {}
});

interface GuestProviderProps {
  children: React.ReactNode;
}

export const GuestProvider: React.FC<GuestProviderProps> = ({ children }) => {  
  const { isConnected, setError, setErrorMessage, blockchain, wallet, refreshWallet } = useContext(AppContext);

  const [authorisation, setAuthorisation] = useState<Authorisation>({timestamp: "", guest: "", status: Status.NULL});

  useEffect(() => {
    if(isConnected) {
      setupListener();

      refresh();
    }
  }, [isConnected]);

  const refresh = async () => {
    getAuthorisation();
    
    refreshWallet();
  }

  const getAuthorisation = async () => {
    let result : Authorisation = await blockchain.contract_fetch.methods.getAuthorisation().call({
      from: wallet.account
    });

    setAuthorisation({
      timestamp: result.timestamp,
      guest: result.guest,
      status: Number(result.status) as Status
    } as Authorisation);
  }

  const requestAuthorisation = async () => {
    const chainId : bigint = await blockchain.web3_send.eth.getChainId();

    if(chainId == BigInt(80001)) {
      blockchain.contract_send.methods.requestAuthorisation().send({
        from: wallet.account,
        gas: blockchain.web3_send.utils.toHex(5000000)
      });
    } else {
      setError(true);
      setErrorMessage("Change network to request the authorisation");
    }
  }

  const setupListener = () => {
    blockchain.contract_fetch.events.pendingAuthorisation().on("data", (event : any) => { 
      if(event.returnValues.guest && event.returnValues.guest.toLowerCase() == wallet.account.toLowerCase()) {
        refresh();
      }
    });

    blockchain.contract_fetch.events.acceptedAuthorisation().on("data", (event : any) => { 
      if(event.returnValues.guest && event.returnValues.guest.toLowerCase() == wallet.account.toLowerCase()) {
        refresh();
      }
    });

    blockchain.contract_fetch.events.newReset().on("data", (event : any) => { 
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