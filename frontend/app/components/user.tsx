'use client';

import { useContext } from "react";
import { AppContext } from "..//context/AppContext";
import Access from "./access";

export default function User () {
    
  const { wallet, setError, buyTicket, accesses, ticket, openDoor } = useContext(AppContext);

    return (
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
    );
}

