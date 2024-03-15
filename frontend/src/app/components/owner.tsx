'use client';

import { useContext } from "react";
import { OwnerContext } from "../context/OwnerProvider";

export default function Owner () {
    const { reset } = useContext(OwnerContext);

    return (
        <p className="text-center mt-4" style={{fontSize: "18px"}}>
            <button type="button" className="btn btn-light border px-3 py-2" onClick={reset}>Reset Contract</button>
        </p>
    );

    /*return (
        <>
            <div className="mt-2 mb-2"  style={{fontSize: "20px"}}>Logged as Owner</div>
            <div className="mt-1 mb-2" style={{fontSize: "20px"}}>Balance: {wallet.balance} MATIC</div>
            <div className="mt-3">
                <button type="button" className="btn btn-light border px-3 py-2" disabled={resetDisabled} onClick={() => reset()}>Reset Contract</button>
            </div>
            <>
                { (resetDisabled && resetStatus) ? (
                    <p className="text-center mt-1 mx-0 pb-1"><strong>You have reset the contract successfully!</strong></p>
                ) : (
                    <></>
                )}
            </>
            <div className="input-group mb-3 mt-3 text-center" style={{width: "600px", marginLeft: "auto", marginRight: "auto"}}>
                <input className="form-control" type="text" value={address} onChange={(e) => {setAddress(e.target.value)}} />
                <button type="button" className="btn btn-light border px-3 py-2" disabled={sendDisabled} onClick={() => sendTicket(address)}>Send Ticket</button>
            </div>
            <>
                { (sendDisabled && sendStatus) ? (
                    <p className="text-center mt-1 mx-0 pb-1"><strong>You have sent the ticket successfully!</strong></p>
                ) : (
                    <></>
                )}
            </>
        </>
    );*/
}

