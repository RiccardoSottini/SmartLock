"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import {
  AppContext,
  Authorisation,
  AccessType,
  Status,
  MAX_GAS_FEE,
  GAS_PRICE,
} from "./AppProvider";

/* Data structure definition returned by the Context */
export type GuestContextType = {
  authorisation: Authorisation;
  accesses: AccessType[];
  requestAuthorisation: (name: string) => void;
  accessDoor: () => void;
};

/* Setup initial values of the Context */
export const GuestContext = createContext<GuestContextType>({
  authorisation: { timestamp: "", guest: "", name: "", status: Status.NULL },
  accesses: [],
  requestAuthorisation: (name: string) => {},
  accessDoor: () => {},
});

/* Props for the GuestProvider */
interface GuestProviderProps {
  children: React.ReactNode;
}

/* GuestProvider Context definition */
export const GuestProvider: React.FC<GuestProviderProps> = ({ children }) => {
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
  const [authorisation, setAuthorisation] = useState<Authorisation>({
    timestamp: "",
    guest: "",
    name: "",
    status: Status.NULL,
  });
  const [accesses, setAccesses] = useState<AccessType[]>([]);

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

  /* React Hook ran when the authorisation is retrieved */
  useEffect(() => {
    /* Check if the authorisation request has been accepted */
    if (authorisation.status == Status.ACCEPTED) {
      /* Call the function to retrieve the door accesses */
      getAccesses();
    }
  }, [authorisation]);

  /* Function used to refresh data */
  const refresh = async () => {
    /* Call the function to retrieve the authorisation request */
    getAuthorisation();
  };

  /* Function used to get the authorisation retrieving it from the blockchain */
  const getAuthorisation = async () => {
    /* Call the contract method to retrieve the authorisation request */
    let result: Authorisation = await blockchain.contract_fetch.methods
      .getAuthorisation()
      .call({
        from: wallet.account,
      });

    /* Set the authorisation with the value returned explicitely casted to Authorisation */
    setAuthorisation({
      timestamp: result.timestamp,
      guest: result.guest,
      status: Number(result.status) as Status,
    } as Authorisation);
  };

  /* Function used to get the door accessess retrieving them from the blockchain */
  const getAccesses = async () => {
    /* Call the contract method to retrieve the door accesses */
    let result: AccessType[] = await blockchain.contract_fetch.methods
      .getAccesses()
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

    /* Set the value for the list of accessess based on the reversed returned list */
    setAccesses(resultAccesses.reverse());
  };

  /* Function used to request an authorisation  */
  const requestAuthorisation = async (name: string) => {
    /* Retrieve the chain id of the network the wallet is connected to */
    const chainId: bigint = await blockchain.web3_send.eth.getChainId();

    /* Check if the chain id is the correct one */
    if (checkChain(chainId)) {
      /* Call the contract method to request the authorisation - handle success and errors */
      blockchain.contract_send.methods
        .requestAuthorisation(name)
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
      setErrorMessage("Change network to request the authorisation");
    }
  };

  /* Function used to access the door  */
  const accessDoor = async () => {
    /* Retrieve the chain id of the network the wallet is connected to */
    const chainId: bigint = await blockchain.web3_send.eth.getChainId();

    /* Check if the chain id is the correct one */
    if (checkChain(chainId)) {
      /* Call the contract method to access the door - handle success and errors */
      blockchain.contract_send.methods
        .accessDoor()
        .send({
          from: wallet.account,
          gas: blockchain.web3_send.utils.toHex(MAX_GAS_FEE),
          gasPrice: blockchain.web3_send.utils.toHex(GAS_PRICE),
        })
        .catch((error: any) => {
          console.log(error);
        });
    } else {
      /* Set error saying to change the network */
      setError(true);
      setErrorMessage("Change network to open the door");
    }
  };

  /* Function used to setup event listeners */
  const setupListener = () => {
    /* Setup event listener fetching updateGuest events - call refresh method when captured */
    blockchain.contract_fetch.events
      .updateGuest({ filter: wallet.account.toLowerCase() })
      .on("data", (event: any) => {
        refresh();
      });

    /* Setup event listener fetching newReset events - call refresh method when captured */
    blockchain.contract_fetch.events.newReset().on("data", (event: any) => {
      refresh();
    });
  };

  /* Setup return value of the Context */
  const contextValue: GuestContextType = {
    authorisation,
    accesses,
    requestAuthorisation,
    accessDoor,
  };

  /* Return the Context value */
  return (
    <GuestContext.Provider value={contextValue}>
      {children}
    </GuestContext.Provider>
  );
};
