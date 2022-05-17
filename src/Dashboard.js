import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  marketplaceAddress, coinName
} from './config'

import NFTMarketplace from './artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

function Dashboard() {

  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await contract.fetchItemsListed()

    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      // console.log("tokenUri", tokenUri)
      // Se puede hacer mas elegante con https://docs.pinata.cloud/gateways/ipfs-gateway-tools
      const url = tokenUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
      // console.log("url", url)

      const metadata = await axios.get(url)
      // console.log("metadata", metadata)

      const imageUri = metadata.data.image

      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        image: imageUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/"),
        name: metadata.data.name,
        description: metadata.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 

  }

  if(loadingState === 'not-loaded') return (
    <div className="d-flex justify-content-center">
      <div className="spinner-border text-primary" role="status"></div>
    </div>)
  if (loadingState === 'loaded' && !nfts.length) return (<h1>No hay NFTs creados por mi en este marketplace</h1>)

  return (
    <>
      <h1>Dashboard</h1>
      <p>NFTs que he creado en este marketplace y están a la venta.</p>

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
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </>
  );
}

export default Dashboard;








