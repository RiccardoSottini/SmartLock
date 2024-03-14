"use client"

import React, { useContext } from 'react';
import { AppContext } from './context/AppProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import Header from './components/header';
import Owner from './components/owner';
import Guest from './components/guest';

export default function Home() {
  const { isConnected, isLoading, wallet, role, error, setError, errorMessage } = useContext(AppContext);
  const styleSpinner : any = {position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"};

  return (
    <>
      <Header/>
      <div className="ml-5 mr-5 my-3 text-center" style={{height: "calc(100% - 100px)"}}>
        { isLoading ? (
          <FontAwesomeIcon icon={faSpinner} size="2x" spin style={styleSpinner}/>
        ) : (
          error ? ( 
              <p onClick={() => setError && setError(false)} style={{fontSize: "18px"}} role="button">
                <strong>Error:</strong> {errorMessage}
              </p>                                     
            ) : (
              isConnected ? (
                <>
                  <div className="mt-2 mb-2" style={{fontSize: "20px", fontWeight: "bold"}}>Logged as: {role.charAt(0).toUpperCase() + role?.toLowerCase().slice(1)}</div>
                  <div className="mt-1 mb-2" style={{fontSize: "20px"}}>Address: {wallet.accounts[0]}</div>
                  <div className="mt-1 mb-2" style={{fontSize: "20px"}}>Balance: {wallet.balance} Polygon (MATIC)</div>
                  { role == "GUEST" ? (
                    <Guest/>
                  ) : (
                    role == "OWNER" ? (
                      <Owner/>
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
    </>
  );
}