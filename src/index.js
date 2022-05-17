import React from 'react';
import ReactDOM from 'react-dom/client';


import {
  BrowserRouter,
  Routes,
  Route,
  NavLink
} from "react-router-dom";

import Home from './Home';
import CreateNft from './CreateNft';
import MyNfts from './MyNfts';
import Dashboard from './Dashboard';
import ResellNft from './ResellNft';

import reportWebVitals from './reportWebVitals';

// eslint-disable-next-line
import bootstrap from 'bootstrap'

import 'bootstrap/dist/css/bootstrap.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>

    <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <NavLink to="/" className="navbar-brand">Market</NavLink>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/" className={isActive => "nav-link" + (isActive ? " active" : "")}>Home</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/create-nft" className={isActive => "nav-link" + (isActive ? " active" : "")}>Crear un NFT</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/my-nfts" className={isActive => "nav-link" + (isActive ? " active" : "")}>Mis NFTs</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/dashboard" className={isActive => "nav-link" + (isActive ? " active" : "")}>Dashboard</NavLink>
              </li>
            </ul>
            <form className="d-flex">
              <input className="form-control me-2" type="search" placeholder="Buscar" aria-label="Buscar" />
              <button className="btn btn-outline-success" type="submit">Buscar</button>
            </form>
          </div>
        </div>
      </nav>
      <hr/>
    <div className="container">
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/create-nft" element={<CreateNft />}/>
          <Route path="/my-nfts" element={<MyNfts />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resell-nft" element={<ResellNft />} />
        </Routes>
    </div>    
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
