'use client';

import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Access from "./access";

export default function Owner () {
  const { wallet, setError, buyTicket, accesses, ticket, openDoor } = useContext(AppContext);

    return (
        <>
            <div className="mt-2 mb-2">Logged as Owner</div>
        </>
    );
}

