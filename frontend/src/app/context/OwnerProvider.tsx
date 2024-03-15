"use client"

import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppContext } from "./AppProvider";

export type OwnerContextType = {
  reset: () => void;
};

export const OwnerContext = createContext<Partial<OwnerContextType>>({});

interface OwnerProviderProps {
  children: React.ReactNode;
}

export const OwnerProvider: React.FC<OwnerProviderProps> = ({ children }) => {  
  const { isConnected, blockchain, wallet, refreshWallet } = useContext(AppContext);

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
  }

  const reset = async () => {
    const chainId : bigint = await blockchain?.web3_send.eth.getChainId();

    if(chainId == BigInt(80001)) {
      blockchain?.contract_send.methods.reset().send({
        from: wallet?.account,
        gas: blockchain?.web3_send.utils.toHex(5000000)
      });
    } else {
      //setError(true);
      //setErrorMessage("Change network to reset the contract");
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

  const contextValue: OwnerContextType = {
    reset,
  };

  return (
    <OwnerContext.Provider value={contextValue}>
      {children}
    </OwnerContext.Provider>
  );
};