'use client';

import makeBlockie from 'ethereum-blockies-base64';
import { useDisclosure } from "@nextui-org/react";
import { OwnerContext } from "../context/OwnerProvider";
import React, { useContext, useEffect, useState } from "react";
import { Authorisation } from "../context/AppProvider";
import OwnerModal from "./owner/modal";
import OwnerTable from "./owner/table";

export default function Owner () {
    const { checkAddress, reset, data, createAuthorisation, acceptAuthorisation, rejectAuthorisation } = useContext(OwnerContext);
    const [rows, setRows] = useState<any>([]);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    useEffect(() => {
        setRows(data.map((value : Authorisation, index : number) => ({
            key: index,
            name: "NAME",
            guest: value.guest,
            link: "https://mumbai.polygonscan.com/address/" + value.guest,
            timestamp:  value.timestamp,
            status: value.status,
            avatar: makeBlockie(value.guest)
        })));
    }, [data]);

    return (
        <>
            <p className="text-center mt-4" style={{fontSize: "18px"}}>
                <button type="button" className="btn btn-light border px-3 py-2" onClick={reset}>Reset Contract</button>
            </p>
            <OwnerTable rows={rows} onOpen={onOpen} acceptAuthorisation={acceptAuthorisation} rejectAuthorisation={rejectAuthorisation}/>
            <OwnerModal checkAddress={checkAddress} rows={rows} isOpen={isOpen} onOpenChange={onOpenChange} createAuthorisation={createAuthorisation}/>
        </>
    );
}

