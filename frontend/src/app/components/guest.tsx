'use client';

import { useState, useContext } from "react";
import { AppContext, Status } from "../context/AppProvider";
import Access from "./access";

export default function Guest () {
    const { wallet, authorisation, requestAuthorisation  } = useContext(AppContext);

    if(authorisation?.status == Status.NULL) {
        return (
            <button type="button" className="btn btn-light border px-3 py-2" onClick={requestAuthorisation}>Request Authorisation</button>
        )
    } 
    
    if(authorisation?.status == Status.PENDING) {
        return (
            <p className="text-center mt-3" style={{fontSize: "18px"}}>You have a pending authorisation</p>
        )
    }


    return (
        <></>
    )

/*return (
<>
    <div className="mt-2 mb-2" style={{fontSize: "20px"}}>Logged as: {wallet.accounts[0]}</div>
    <div className="mt-1 mb-2" style={{fontSize: "20px"}}>Balance: {wallet.balance} MATIC</div>
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
            {accesses.map((access : any, key : any) => (
            <Access key={key} timestamp={access.timestamp.toString()}/>
            ))}
        </div>
        </>
    ) : (
        <></>
    )}
</>
);*/
}

