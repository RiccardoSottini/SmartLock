"use client";

import { useContext } from "react";
import { AppContext } from "../context/AppProvider";

/* Header React component - header component of the page */
export default function Header() {
  /* Load App Context */
  const { connectWallet, isConnected, isConnecting } = useContext(AppContext);

  /* Return header JSX markup */
  return (
    <header
      id="navbar-main"
      className="navbar navbar-dark flex-column flex-md-row border-bottom"
    >
      <a
        className="navbar-brand ml-5 text-dark font-weight-bold"
        href=""
        aria-label="SmartDoor"
      >
        SmartDoor
      </a>
      <div className="navbar-nav align-items-center flex-row flex-wrap">
        <li className="nav-item col-md-auto ml-1 mr-5">
          {!isConnected && (
            <button
              className="nav-link nav-link-button ps-3 pe-3 text-dark"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              Connect Wallet
            </button>
          )}
        </li>
      </div>
    </header>
  );
}
