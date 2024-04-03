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

export default function Owner() {
  const {
    checkAddress,
    reset,
    data,
    getAccesses,
    createAuthorisation,
    acceptAuthorisation,
    rejectAuthorisation,
  } = useContext(OwnerContext);
  const [rows, setRows] = useState<any>([]);
  const [accesses, setAccesses] = useState<any>([]);
  const [guestValue, setGuest] = useState<any>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isOpenHistory, setOpenHistory] = useState<boolean>(false);

  useEffect(() => {
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

    if (isOpenHistory) {
      onOpenHistory(guestValue);
    }
  }, [data]);

  const onOpenHistory = async (guest: string) => {
    setGuest(guest);
    setAccesses(await getAccesses(guest));
    setOpenHistory(true);
  };

  const onCloseHistory = () => {
    setGuest(null);
    setAccesses([]);
    setOpenHistory(false);
  };

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
