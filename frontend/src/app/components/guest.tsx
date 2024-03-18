'use client';

import { useContext, useState, useEffect} from "react";
import { GuestContext } from "../context/GuestProvider";
import { Status } from "../context/AppProvider";
import Access from "./guest/access";
import { Input } from "@nextui-org/react";

export default function Guest () {
    const { authorisation, accesses, requestAuthorisation, accessDoor } = useContext(GuestContext);
    const [ name, setName ] = useState<string | undefined>();
    const [ error, setError ] = useState<boolean>(false);
    const [ isProcessing, setProcessing ] = useState<boolean>(false);

    useEffect(() => {
        setError(name?.trim().length == 0);
    }, [name]);

    useEffect(() => {
        setName(undefined);
        setError(false);
        setProcessing(false);
    }, [authorisation]);

    const renderStatus = (status : Status) => {
        if(status == Status.PENDING) {
            return "You have a pending request for authorisation";
        } else if(status == Status.ACCEPTED) {
            return "Your authorisation has been accepted";
        } else if(status == Status.REJECTED) {
            return "Your authorisation has been rejected";
        }

        return "";
    }

    const request = async (event : any) => {
        setProcessing(true);
        requestAuthorisation(name ? name : "");
    }

    if(authorisation.status == Status.NULL) {
        return (
            <p className="text-center mt-4" style={{fontSize: "18px"}}>
                <div className="relative justify-center w-full row row-cols-2 mb-3">
                    <Input
                        autoFocus
                        endContent={
                            ""
                        }
                        label="Name"
                        placeholder="Enter your name"
                        variant="bordered"
                        value={name}
                        onValueChange={setName}     
                        isInvalid={error}
                        errorMessage={error ? "Enter a valid name" : ""}
                        disabled={isProcessing}
                    />
                </div>
                <div className="relative justify-center w-full row row-cols-2 px-4">
                    <button type="button" className="btn btn-light border px-3 py-2" onClick={request} disabled={error || name == undefined || isProcessing}>Request Authorisation</button>
                </div>
            </p>
        )
    } else {
        return (
            <>
                <p className="text-center mt-4" style={{fontSize: "18px"}}>
                    <span className="font-bold">{renderStatus(authorisation.status)}</span>
                </p>
                {(authorisation.status == Status.PENDING) ? (
                    <p className="text-center mt-0" style={{fontSize: "18px"}}>
                        <span>Requested on </span>
                        { new Intl.DateTimeFormat('en-GB', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(parseInt(authorisation.timestamp) * 1000)}
                    </p>
                ) : (
                    <></>
                )}
                {(authorisation.status == Status.ACCEPTED) ? (
                    <>
                        <p className="text-center mt-3" style={{fontSize: "18px"}}>
                            <button type="button" className="btn btn-light border px-3 py-2" onClick={accessDoor}>Access the Door</button>
                        </p>
                        {accesses.length ? (
                            <>
                                <div className="mt-4 mb-2" style={{fontSize: "20px", fontWeight: "bold"}}>
                                    History of accesses to the door
                                </div>
                                <div className="flex flex-col relative gap-4 w-full mt-2 pb-4">
                                    <div className="p-4 pb-0 z-0 flex flex-col relative justify-between gap-4 bg-content1 overflow-auto rounded-large shadow-small w-full">
                                        <div className="row row-cols-3 row-cols-md-3 row-cols-lg-4">
                                            {accesses.map((access : any, index : number) => (
                                                <Access key={index} timestamp={access.timestamp.toString()}/>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="mt-4 mb-2" style={{fontSize: "20px", fontWeight: "bold"}}>
                                You have never accessed the door before
                            </div>
                        )}
                    </>
                ) : (
                    <></>
                )}
            </>
        )
    }

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

