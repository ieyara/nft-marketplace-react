import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal';

import { useNavigate } from "react-router-dom";

import {
  marketplaceAddress, coinName, ipfsGateway, providerOptions
} from './config'

import NFTMarketplace from './artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'


function MyNfts() {
  
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  let navigate = useNavigate();

  // Le decimos a React que ejecute loadNFTs cada vez que se haga un renderizado
  useEffect(() => {
    loadMyNFTs()
  }, [])

  async function loadMyNFTs() {
    setLoadingState('not-loaded');
    const web3Modal = new Web3Modal({
      providerOptions // required
    });
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await contract.fetchMyNFTs()

    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      // console.log("tokenUri", tokenUri)
      // Se puede hacer mas elegante con https://docs.pinata.cloud/gateways/ipfs-gateway-tools
      const url = tokenUri.replace("ipfs://", ipfsGateway + "/ipfs/")
      // console.log("url", url)

      const metadata = await axios.get(url)
      // console.log("metadata", metadata)

      const imageUri = metadata.data.image

      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        image: imageUri.replace("ipfs://", ipfsGateway + "/ipfs/"),
        name: metadata.data.name,
        description: metadata.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }

  const listNFT = (nft) => {
    navigate(`/resell-nft?id=${nft.tokenId}&image=${nft.image}`);
  }


  if(loadingState === 'not-loaded') return (
    <div className="d-flex justify-content-center">
      <div className="spinner-border text-primary" role="status"></div>
    </div>)
  if (loadingState === 'loaded' && !nfts.length) return (<h1>No tengo NFTs de este marketplace</h1>)

  return (
    <>
      <h1>Mis NFTs</h1>
      <p>NFTs que he comprado en este marketplace.</p>
      <div className="row row-cols-1 row-cols-md-5 g-3">
        {
          nfts.map((nft, i) => (
            <div key={i} className="col d-flex align-items-stretch">
              <div className="card">
                <img src={nft.image} className="card-img-top" alt="{nft.name}"/>
                <div className="card-body">
                  <h5 className="card-title">{nft.name}</h5>
                  <p className="card-text">{nft.description}</p>
                </div>
                <div className="card-footer">
                  <h3 className="text-center">{nft.price} {coinName}</h3>
                  <button className="btn btn-primary w-100" onClick={() => listNFT(nft)}>Poner en venta</button>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </>
  );
}

export default MyNfts;






