"use client";

import makeBlockie from "ethereum-blockies-base64";
import { useDisclosure } from "@nextui-org/react";
import { OwnerContext } from "../context/OwnerProvider";
import React, { useContext, useEffect, useState } from "react";
import { Authorisation } from "../context/AppProvider";
import OwnerModal from "./owner/modal";
import OwnerReset from "./owner/reset";
import OwnerTable from "./owner/table";
import OwnerHistory from "./owner/history";

/* Owner React component - page for the Owner */
export default function Owner() {
  /* Load Owner Context */
  const {
    checkAddress,
    reset,
    data,
    getAccesses,
    createAuthorisation,
    acceptAuthorisation,
    rejectAuthorisation,
  } = useContext(OwnerContext);

  /* Component variables definition */
  const [rows, setRows] = useState<any>([]);
  const [accesses, setAccesses] = useState<any>([]);
  const [guestValue, setGuest] = useState<any>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isOpenHistory, setOpenHistory] = useState<boolean>(false);

  /* React Hook called everytime the list of authorisations is changed */
  useEffect(() => {
    /* Set the value of the table rows by formatting each authorisation */
    setRows(
      data.map((value: Authorisation, index: number) => ({
        key: index,
        name: value.name,
        guest: value.guest,
        link: "https://www.oklink.com/amoy/address/" + value.guest,
        timestamp: value.timestamp,
        status: value.status,
        avatar: makeBlockie(value.guest),
      }))
    );

    /* Check if history modal is open */
    if (isOpenHistory) {
      /* Call the function to display the history modal */
      onOpenHistory(guestValue);
    }
  }, [data]);

  /* Function used to retrieve door accessess of a guest and display on the history modal */
  const onOpenHistory = async (guest: string) => {
    /* Setup variables used to display the history modal */
    setGuest(guest);
    setAccesses(await getAccesses(guest));
    setOpenHistory(true);
  };

  /* Function used to close the history modal */
  const onCloseHistory = () => {
    /* Setup variables used to display the history modal with their initial values */
    setGuest(null);
    setAccesses([]);
    setOpenHistory(false);
  };

  /* Return owner JSX markup */
  return (
    <>
      <OwnerReset reset={reset} />
      <OwnerTable
        rows={rows}
        onOpen={onOpen}
        onOpenHistory={onOpenHistory}
        acceptAuthorisation={acceptAuthorisation}
        rejectAuthorisation={rejectAuthorisation}
      />
      <OwnerModal
        checkAddress={checkAddress}
        rows={rows}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        createAuthorisation={createAuthorisation}
      />
      <OwnerHistory
        accesses={accesses}
        isOpenHistory={isOpenHistory}
        onCloseHistory={onCloseHistory}
      />
    </>
  );
}
