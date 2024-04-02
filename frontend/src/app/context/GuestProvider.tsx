"use client"

import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppContext, Authorisation, AccessType, Status, MAX_GAS_FEE, GAS_PRICE } from "./AppProvider";

export type GuestContextType = {
  authorisation: Authorisation;
  accesses: AccessType[],
  requestAuthorisation: (name: string) => void;
  accessDoor: () => void;
};

export const GuestContext = createContext<GuestContextType>({
  authorisation: { timestamp: "", guest: "", name: "", status: Status.NULL },
  accesses: [],
  requestAuthorisation: (name: string) => {},
  accessDoor: () => {}
});

interface GuestProviderProps {
  children: React.ReactNode;
}

export const GuestProvider: React.FC<GuestProviderProps> = ({ children }) => {  
  const { isConnected, setError, setErrorMessage, blockchain, wallet, checkChain } = useContext(AppContext);

  const [authorisation, setAuthorisation] = useState<Authorisation>({timestamp: "", guest: "", name: "", status: Status.NULL});
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

    setAccesses(resultAccesses.reverse());
  }

  const requestAuthorisation = async (name: string) => {
    const chainId : bigint = await blockchain.web3_send.eth.getChainId();

    if(checkChain(chainId)) {
      blockchain.contract_send.methods.requestAuthorisation(name).send({
        from: wallet.account,
        gas: blockchain.web3_send.utils.toHex(MAX_GAS_FEE)
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

    if(checkChain(chainId)) {
      blockchain.contract_send.methods.accessDoor().send({
        from: wallet.account,
        gas: blockchain.web3_send.utils.toHex(MAX_GAS_FEE),
        gasPrice: blockchain.web3_send.utils.toHex(GAS_PRICE)
      }).catch((error : any) => {
        console.log(error);
      });
    } else {
      setError(true);
      setErrorMessage("Change network to open the door");
    }
  }

  const setupListener = () => {
    blockchain.contract_fetch.events.updateGuest({filter: wallet.account.toLowerCase()}).on("data", (event : any) => { 
      refresh();
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