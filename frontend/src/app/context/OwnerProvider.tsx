"use client"

import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppContext, Authorisation, Status } from "./AppProvider";

export type OwnerContextType = {
  data: Authorisation[],
  reset: () => void;
};

export const OwnerContext = createContext<OwnerContextType>({
  data: [],
  reset: () => {}
});

interface OwnerProviderProps {
  children: React.ReactNode;
}

export const OwnerProvider: React.FC<OwnerProviderProps> = ({ children }) => {  
  const { isConnected, setError, setErrorMessage, blockchain, wallet, refreshWallet } = useContext(AppContext);

  const [data, setData] = useState<Authorisation[]>([]);

  useEffect(() => {
    if(isConnected) {
      setupListener();

      refresh();
    }
  }, [isConnected]);

  useEffect(() => {
    //console.log(data);
  }, [data]);

  const refresh = async () => {
    getData();

    refreshWallet();
  }

  const getData = async () => {
    let result : Authorisation[] = await blockchain.contract_fetch.methods.getData().call({
      from: wallet.account
    });

    console.log(result);

    let authorisations : Authorisation[] = [];

    result.forEach(function(authorisation) {
      authorisations.push({
        timestamp: authorisation.timestamp,
        guest: authorisation.guest,
        status: Number(authorisation.status) as Status
      } as Authorisation);
    });

    setData(authorisations);
  }

  const reset = async () => {
    const chainId : bigint = await blockchain.web3_send.eth.getChainId();

    if(chainId == BigInt(80001)) {
      blockchain.contract_send.methods.reset().send({
        from: wallet.account,
        gas: blockchain.web3_send.utils.toHex(5000000)
      });
    } else {
      setError(true);
      setErrorMessage("Change network to reset the contract");
    }
  }

  const setupListener = () => {
    blockchain.contract_fetch.events.pendingAuthorisation().on("data", (event : any) => { 
      refresh();
    });

    blockchain.contract_fetch.events.acceptedAuthorisation().on("data", (event : any) => { 
      refresh();
    });

    blockchain.contract_fetch.events.newReset().on("data", (event : any) => { 
      refresh();
    });
  }

  const contextValue: OwnerContextType = {
    data,
    reset,
  };

  return (
    <OwnerContext.Provider value={contextValue}>
      {children}
    </OwnerContext.Provider>
  );
};