"use client"

import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppContext, Authorisation, Status, AccessType, GAS_FEE } from "./AppProvider";

export type OwnerContextType = {
  data: Authorisation[];
  createAuthorisation: (name: string, guest: string) => void;
  acceptAuthorisation: (guest: string) => void;
  rejectAuthorisation: (guest: string) => void;
  reset: () => void;
  checkAddress: (address: string) => boolean;
  getAccesses: (guest: string) => Promise<AccessType[]>;
};

export const OwnerContext = createContext<OwnerContextType>({
  data: [],
  createAuthorisation: (name: string, guest: string) => {},
  acceptAuthorisation: (guest: string) => {},
  rejectAuthorisation: (guest: string) => {},
  reset: () => {},
  checkAddress: (address: string) => true,
  getAccesses: (guest: string) => new Promise(() => {})
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

  /*useEffect(() => {
    console.log(data);
  }, [data]);*/

  const refresh = async () => {
    getData();
  }

  const getData = async () => {
    let result : Authorisation[] = await blockchain.contract_fetch.methods.getData().call({
      from: wallet.account
    });

    let authorisations: Authorisation[] = [];

    result.forEach(function(authorisation) {
      authorisations.push({
        timestamp: authorisation.timestamp,
        guest: authorisation.guest,
        name: authorisation.name,
        status: Number(authorisation.status) as Status
      });
    });

    setData(authorisations);
  }

  const createAuthorisation = async (name: string, guest: string) => {
    const chainId : bigint = await blockchain.web3_send.eth.getChainId();

    if(chainId == BigInt(80001)) {
      blockchain.contract_send.methods.createAuthorisation(name, guest).send({
        from: wallet.account,
        gas: blockchain.web3_send.utils.toHex(GAS_FEE)
      }).catch((error : any) => {
        console.log(error);
      });
    } else {
      setError(true);
      setErrorMessage("Change network to create the authorisation");
    }
  }

  const acceptAuthorisation = async (guest: string) => {
    const chainId : bigint = await blockchain.web3_send.eth.getChainId();

    if(chainId == BigInt(80001)) {
      blockchain.contract_send.methods.acceptAuthorisation(guest).send({
        from: wallet.account,
        gas: blockchain.web3_send.utils.toHex(GAS_FEE)
      }).catch((error : any) => {
        console.log(error);
      });
    } else {
      setError(true);
      setErrorMessage("Change network to accept the request for authorisation");
    }
  }

  const rejectAuthorisation = async (guest: string) => {
    const chainId : bigint = await blockchain.web3_send.eth.getChainId();

    if(chainId == BigInt(80001)) {
      blockchain.contract_send.methods.rejectAuthorisation(guest).send({
        from: wallet.account,
        gas: blockchain.web3_send.utils.toHex(GAS_FEE)
      }).catch((error : any) => {
        console.log(error);
      });
    } else {
      setError(true);
      setErrorMessage("Change network to reject the request for authorisation");
    }
  }

  const getAccesses = async (guest: string) => {
    let result : AccessType[] = await blockchain.contract_fetch.methods.getAccesses(guest).call({
      from: wallet.account
    });

    let resultAccesses: AccessType[] = [];

    result.forEach(function(access) {
      resultAccesses.push({
        timestamp: access.timestamp,
        guest: access.guest,
      } as AccessType);
    });

    return resultAccesses.reverse();
  }

  const reset = async () => {
    const chainId : bigint = await blockchain.web3_send.eth.getChainId();

    if(chainId == BigInt(80001)) {
      blockchain.contract_send.methods.reset().send({
        from: wallet.account,
        gas: blockchain.web3_send.utils.toHex(GAS_FEE)
      }).catch((error : any) => {
        console.log(error);
      });
    } else {
      setError(true);
      setErrorMessage("Change network to reset the contract");
    }
  }

  const setupListener = () => {
    blockchain.contract_fetch.events.updateOwner().on("data", (event : any) => { 
      refresh();
      console.log("1");
    });
  }

  const checkAddress = (address: string) => blockchain.web3_fetch.utils.isAddress(address);

  const contextValue: OwnerContextType = {
    data,
    createAuthorisation,
    acceptAuthorisation,
    rejectAuthorisation,
    reset,
    checkAddress,
    getAccesses
  };

  return (
    <OwnerContext.Provider value={contextValue}>
      {children}
    </OwnerContext.Provider>
  );
};