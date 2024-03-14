'use client';

import { useContext } from "react";
import { AppContext } from "../context/AppProvider";

export default function Header() {
    const { handleConnect, isConnected, isConnecting } = useContext(AppContext);

    return (
        <header id="navbar-main" className="navbar navbar-dark flex-column flex-md-row border-bottom">
            <a className="navbar-brand ml-5 text-dark font-weight-bold" href="" aria-label="SmartDoor">
                SmartDoor
            </a>         
            <div className="navbar-nav align-items-center flex-row flex-wrap">
                <li className="nav-item col-md-auto ml-1 mr-1">
                    <a className="nav-link ps-3 pe-3 text-dark" href="dissertation">Dissertation PDF</a>
                </li>
                <li className="nav-item col-md-auto ml-1 mr-1">
                    <a className="nav-link ps-3 pe-3 text-dark" href="installation">Installation</a>
                </li>
                <li className="nav-item col-md-auto ml-1 mr-5"> 
                {!isConnected &&
                    <button className="nav-link nav-link-button ps-3 pe-3 text-dark" onClick={handleConnect} disabled={isConnecting}>Connect Wallet</button>
                }
                </li>
            </div>
        </header>
    )
}