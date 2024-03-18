"use client"

import React, { useContext } from 'react';
import { AppContext, Role } from './context/AppProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { NextUIProvider } from "@nextui-org/react";
import Header from './components/header';
import Owner from './components/owner';
import Guest from './components/guest';

import { GuestProvider } from './context/GuestProvider';
import { OwnerProvider } from './context/OwnerProvider';

export default function Home() {
  const { isConnected, isLoading, wallet, role, error, setError, errorMessage } = useContext(AppContext);

  return (
    <NextUIProvider>
      <Header/>
      <div className="ml-5 mr-5 my-3 text-center" style={{height: "calc(100% - 100px)"}}>
        { isLoading ? (
          <FontAwesomeIcon icon={faSpinner} size="2x" spin style={{position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}/>
        ) : (
          error ? ( 
              <p onClick={() => setError && setError(false)} style={{fontSize: "18px"}} role="button">
                <strong>Error:</strong> {errorMessage}
              </p>                                     
            ) : (
              isConnected ? (
                <>
                  <div className="mt-2 mb-2" style={{fontSize: "20px", fontWeight: "bold"}}>
                    <span>Logged as: </span>
                    {role == Role.GUEST ? "Guest" : (role == Role.OWNER ? "Owner" : "")}
                  </div>
                  <div className="mt-1 mb-2" style={{fontSize: "20px"}}>Address: {wallet.account}</div>
                  <div className="mt-1 mb-2" style={{fontSize: "20px"}}>Balance: {wallet.balance} Polygon (MATIC)</div>
                  { role == Role.GUEST ? (
                    <GuestProvider>
                      <Guest/>
                    </GuestProvider>
                  ) : (
                    role == Role.OWNER ? (
                      <OwnerProvider>
                        <Owner/>
                      </OwnerProvider>
                    ) : (
                      <></>
                    )
                  )}
                </>
              ) : (
                <p onClick={() => setError && setError(false)} style={{fontSize: "18px"}}>Connect the Wallet to use the service.</p>
              )
            )
          )
        }
      </div>
    </NextUIProvider>
  );
}