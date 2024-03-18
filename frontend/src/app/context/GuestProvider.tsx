"use client"

import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppContext, Authorisation, AccessType, Status, GAS_FEE } from "./AppProvider";

export type GuestContextType = {
  authorisation: Authorisation;
  accesses: AccessType[],
  requestAuthorisation: () => void;
  accessDoor: () => void;
};

export const GuestContext = createContext<GuestContextType>({
  authorisation: { timestamp: "", guest: "", status: Status.NULL },
  accesses: [],
  requestAuthorisation: () => {},
  accessDoor: () => {}
});

interface GuestProviderProps {
  children: React.ReactNode;
}

export const GuestProvider: React.FC<GuestProviderProps> = ({ children }) => {  
  const { isConnected, setError, setErrorMessage, blockchain, wallet, refreshWallet } = useContext(AppContext);

  const [authorisation, setAuthorisation] = useState<Authorisation>({timestamp: "", guest: "", status: Status.NULL});
  const [accesses, setAccesses] = useState<AccessType[]>([]);

  useEffect(() => {
    if(isConnected) {
      setupListener();

      refresh();
    }
  }, [isConnected]);

  useEffect(() => {
    if(authorisation.status == Status.ACCEPTED) {
      getAccesses();
    }
  }, [authorisation]);

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

  const getAccesses = async () => {
    let result : AccessType[] = await blockchain.contract_fetch.methods.getAccesses().call({
      from: wallet.account
    });

    let resultAccesses: AccessType[] = [];

    result.forEach(function(access) {
      resultAccesses.push({
        timestamp: access.timestamp,
        guest: access.guest,
      } as AccessType);
    });

    setAccesses(resultAccesses);
  }

  const requestAuthorisation = async () => {
    const chainId : bigint = await blockchain.web3_send.eth.getChainId();

    if(chainId == BigInt(80001)) {
      blockchain.contract_send.methods.requestAuthorisation().send({
        from: wallet.account,
        gas: blockchain.web3_send.utils.toHex(GAS_FEE)
      }).catch((error : any) => {
        console.log(error);
      });
    } else {
      setError(true);
      setErrorMessage("Change network to request the authorisation");
    }
  }

  const accessDoor = async () => {
    const chainId : bigint = await blockchain.web3_send.eth.getChainId();

    if(chainId == BigInt(80001)) {
      blockchain.contract_send.methods.accessDoor().send({
        from: wallet.account,
        gas: blockchain.web3_send.utils.toHex(GAS_FEE)
      }).catch((error : any) => {
        console.log(error);
      });
    } else {
      setError(true);
      setErrorMessage("Change network to open the door");
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

    blockchain.contract_fetch.events.rejectedAuthorisation().on("data", (event : any) => { 
      if(event.returnValues.guest && event.returnValues.guest.toLowerCase() == wallet.account.toLowerCase()) {
        refresh();
      }
    });

    blockchain.contract_fetch.events.newAccess().on("data", (event : any) => { 
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
    accesses,
    requestAuthorisation,
    accessDoor
  };

  return (
    <GuestContext.Provider value={contextValue}>
      {children}
    </GuestContext.Provider>
  );
};