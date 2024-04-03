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
    if (isConnected) {
      setupListener();

      refresh();
    }
  }, [isConnected]);

  /* React Hook ran when the authorisation is retrieved */
  useEffect(() => {
    if (authorisation.status == Status.ACCEPTED) {
      getAccesses();
    }
  }, [authorisation]);

  /* Function used to refresh data */
  const refresh = async () => {
    getAuthorisation();
  };

  /* Function used to get the authorisation retrieving it from the blockchain */
  const getAuthorisation = async () => {
    let result: Authorisation = await blockchain.contract_fetch.methods
      .getAuthorisation()
      .call({
        from: wallet.account,
      });

    setAuthorisation({
      timestamp: result.timestamp,
      guest: result.guest,
      status: Number(result.status) as Status,
    } as Authorisation);
  };

  /* Function used to get the door accessess retrieving them from the blockchain */
  const getAccesses = async () => {
    let result: AccessType[] = await blockchain.contract_fetch.methods
      .getAccesses()
      .call({
        from: wallet.account,
      });

    let resultAccesses: AccessType[] = [];

    result.forEach(function (access) {
      resultAccesses.push({
        timestamp: access.timestamp,
        guest: access.guest,
      } as AccessType);
    });

    setAccesses(resultAccesses.reverse());
  };

  /* Function used to request an authorisation  */
  const requestAuthorisation = async (name: string) => {
    const chainId: bigint = await blockchain.web3_send.eth.getChainId();

    if (checkChain(chainId)) {
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
      setError(true);
      setErrorMessage("Change network to request the authorisation");
    }
  };

  /* Function used to access the door  */
  const accessDoor = async () => {
    const chainId: bigint = await blockchain.web3_send.eth.getChainId();

    if (checkChain(chainId)) {
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
      setError(true);
      setErrorMessage("Change network to open the door");
    }
  };

  /* Function used to setup event listeners */
  const setupListener = () => {
    blockchain.contract_fetch.events
      .updateGuest({ filter: wallet.account.toLowerCase() })
      .on("data", (event: any) => {
        refresh();
      });

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
