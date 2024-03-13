'use client';

import { useContext } from "react";
import { AppContext } from "./context/AppContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import Header from "./header";
import User from "./components/user";
import Owner from "./components/owner";

export default function Home() {
  const { isLoading, wallet, error, setError, errorMessage, isOwner } = useContext(AppContext);
  const styleSpinner : any = {position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"};

  return (
    <>
      <Header/>
      <div className="ml-5 mr-5 my-3 text-center" style={{height: "calc(100% - 100px)"}}>
        { isLoading ? (
          <FontAwesomeIcon icon={faSpinner} size="2x" spin style={styleSpinner}/>
        ) : (
          error ? ( 
              <p onClick={() => setError(false)} style={{fontSize: "18px"}} role="button">
                <strong>Error:</strong> {errorMessage}
              </p>                                     
            ) : (
              wallet.accounts.length > 0 ? (
                isOwner ? (
                  <Owner/>
                ) : (
                  <User/>
                )
              ) : (
                <p onClick={() => setError(false)} style={{fontSize: "18px"}}>Connect the Wallet to use the service.</p>
              )
            )
          )
        }
      </div>
    </>
  );
}