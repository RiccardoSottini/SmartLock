'use client';

import { useContext } from "react";
import { AppContext } from "./context/AppContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import Access from "./components/access";
import Header from "./header";

export default function Home() {
  const { isLoading, wallet, error, setError, errorMessage, buyTicket, accesses, ticket, openDoor } = useContext(AppContext);
  const styleSpinner = {position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"};

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
                <>
                  <div className="mt-2 mb-2">Logged as: {wallet.accounts[0]}</div>
                  <div className="mt-1 mb-2">Balance: {wallet.balance} MATIC</div>
                  <div className="mt-3">
                    { ticket ? (
                      <button type="button" className="btn btn-light border px-3 py-2" onClick={() => openDoor()}>Open Door</button>
                    ) : (
                      <button type="button" className="btn btn-light border px-3 py-2" onClick={() => buyTicket()}>Buy Ticket for 0.1 MATIC</button>
                    )}
                  </div>
                  { ticket ? (
                    <>
                      <div className="row mt-4 mx-5">
                        <div className="col">
                          <p className="text-left mx-0 border-b pb-1"><strong>Previous accesses to the door</strong></p>
                          { !accesses.length ? (
                            <p className="text-left">You have never accessed the door before.</p>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 row row-cols-1 row-cols-md-3 row-cols-lg-4 mx-5">
                        {accesses.map((access : any, index : any) => (
                          <Access index={index} timestamp={access.timestamp.toString()}/>
                        ))}
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </>
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