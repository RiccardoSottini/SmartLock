"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import {
  AppContext,
  Authorisation,
  Status,
  AccessType,
  MAX_GAS_FEE,
} from "./AppProvider";

/* Data structure definition returned by the Context */
export type OwnerContextType = {
  data: Authorisation[];
  createAuthorisation: (name: string, guest: string) => void;
  acceptAuthorisation: (guest: string) => void;
  rejectAuthorisation: (guest: string) => void;
  reset: () => void;
  checkAddress: (address: string) => boolean;
  getAccesses: (guest: string) => Promise<AccessType[]>;
};

/* Setup initial values of the Context */
export const OwnerContext = createContext<OwnerContextType>({
  data: [],
  createAuthorisation: (name: string, guest: string) => {},
  acceptAuthorisation: (guest: string) => {},
  rejectAuthorisation: (guest: string) => {},
  reset: () => {},
  checkAddress: (address: string) => true,
  getAccesses: (guest: string) => new Promise(() => {}),
});

/* Props for the OwnerProvider */
interface OwnerProviderProps {
  children: React.ReactNode;
}

/* OwnerProvider Context definition */
export const OwnerProvider: React.FC<OwnerProviderProps> = ({ children }) => {
  /* Load App Context */
  const {
    isConnected,
    setError,
    setErrorMessage,
    blockchain,
    wallet,
    checkChain,
  } = useContext(AppContext);

  /* Context variables definition */
  const [data, setData] = useState<Authorisation[]>([]);

  /* React Hook ran when the wallet connection is completed */
  useEffect(() => {
    /* Check if the connection is completed */
    if (isConnected) {
      /* Call the function to setup the contract event listeners */
      setupListener();

      /* Call the function to refresh the data */
      refresh();
    }
  }, [isConnected]);

  /* Function used to refresh data */
  const refresh = async () => {
    /* Call the function to retrieve all the authorisations */
    getData();
  };

  /* Function used to get all authorisations from the blockchain */
  const getData = async () => {
    /* Call the contract method to retrieve the authorisations */
    let result: Authorisation[] = await blockchain.contract_fetch.methods
      .getData()
      .call({
        from: wallet.account,
      });

    /* List storing the resulting authorisations after the explicit cast */
    let authorisations: Authorisation[] = [];

    /* Loop through all the authorisations */
    result.forEach(function (authorisation) {
      /* Set the authorisations with the value explicitely casted */
      authorisations.push({
        timestamp: authorisation.timestamp,
        guest: authorisation.guest,
        name: authorisation.name,
        status: Number(authorisation.status) as Status,
      });
    });

    /* Set the value for the authorisations */
    setData(authorisations);
  };

  /* Function used to get the door accessess of a guest retrieving them from the blockchain */
  const getAccesses = async (guest: string) => {
    /* Call the contract method to retrieve the door accesses of a guest */
    let result: AccessType[] = await blockchain.contract_fetch.methods
      .getAccesses(guest)
      .call({
        from: wallet.account,
      });

    /* List storing the resulting door accessess after the explicit cast */
    let resultAccesses: AccessType[] = [];

    /* Loop through all the door accessess */
    result.forEach(function (access) {
      /* Set the door accesses with the value returned explicitely casted to AccessType */
      resultAccesses.push({
        timestamp: access.timestamp,
        guest: access.guest,
      } as AccessType);
    });

    /* Return the list of accessess based on the reversed returned list */
    return resultAccesses.reverse();
  };

  /* Function used to create an authorisation  */
  const createAuthorisation = async (name: string, guest: string) => {
    /* Retrieve the chain id of the network the wallet is connected to */
    const chainId: bigint = await blockchain.web3_send.eth.getChainId();

    /* Check if the chain id is the correct one */
    if (checkChain(chainId)) {
      /* Call the contract method to create an authorisation request - handle success and errors */
      blockchain.contract_send.methods
        .createAuthorisation(name, guest)
        .send({
          from: wallet.account,
          gas: blockchain.web3_send.utils.toHex(MAX_GAS_FEE),
        })
        .catch((error: any) => {
          console.log(error);
        });
    } else {
      /* Set error saying to change the network */
      setError(true);
      setErrorMessage("Change network to create the authorisation");
    }
  };

  /* Function used to accept an authorisation  */
  const acceptAuthorisation = async (guest: string) => {
    /* Retrieve the chain id of the network the wallet is connected to */
    const chainId: bigint = await blockchain.web3_send.eth.getChainId();

    /* Check if the chain id is the correct one */
    if (checkChain(chainId)) {
      /* Call the contract method to accept the authorisation request - handle success and errors */
      blockchain.contract_send.methods
        .acceptAuthorisation(guest)
        .send({
          from: wallet.account,
          gas: blockchain.web3_send.utils.toHex(MAX_GAS_FEE),
        })
        .catch((error: any) => {
          console.log(error);
        });
    } else {
      /* Set error saying to change the network */
      setError(true);
      setErrorMessage("Change network to accept the request for authorisation");
    }
  };

  /* Function used to reject an authorisation  */
  const rejectAuthorisation = async (guest: string) => {
    /* Retrieve the chain id of the network the wallet is connected to */
    const chainId: bigint = await blockchain.web3_send.eth.getChainId();

    /* Check if the chain id is the correct one */
    if (checkChain(chainId)) {
      /* Call the contract method to reject the authorisation request - handle success and errors */
      blockchain.contract_send.methods
        .rejectAuthorisation(guest)
        .send({
          from: wallet.account,
          gas: blockchain.web3_send.utils.toHex(MAX_GAS_FEE),
        })
        .catch((error: any) => {
          console.log(error);
        });
    } else {
      /* Set error saying to change the network */
      setError(true);
      setErrorMessage("Change network to reject the request for authorisation");
    }
  };

  /* Function used to reset the contract  */
  const reset = async () => {
    /* Retrieve the chain id of the network the wallet is connected to */
    const chainId: bigint = await blockchain.web3_send.eth.getChainId();

    /* Check if the chain id is the correct one */
    if (checkChain(chainId)) {
      /* Call the contract method to reset the contract - handle success and errors */
      blockchain.contract_send.methods
        .reset()
        .send({
          from: wallet.account,
          gas: blockchain.web3_send.utils.toHex(MAX_GAS_FEE),
        })
        .catch((error: any) => {
          console.log(error);
        });
    } else {
      /* Set error saying to change the network */
      setError(true);
      setErrorMessage("Change network to reset the contract");
    }
  };

  /* Function used to setup event listeners */
  const setupListener = () => {
    /* Setup event listener fetching updateOwner events - call refresh method when captured */
    blockchain.contract_fetch.events.updateOwner().on("data", (event: any) => {
      refresh();
    });
  };

  /* Function used to check validity of an address */
  const checkAddress = (address: string) =>
    blockchain.web3_fetch.utils.isAddress(address);

  /* Setup return value of the Context */
  const contextValue: OwnerContextType = {
    data,
    createAuthorisation,
    acceptAuthorisation,
    rejectAuthorisation,
    reset,
    checkAddress,
    getAccesses,
  };

  /* Return the Context value */
  return (
    <OwnerContext.Provider value={contextValue}>
      {children}
    </OwnerContext.Provider>
  );
};
