import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  marketplaceAddress, mumbaiRpcUrl, coinName
} from './config'

import NFTMarketplace from './artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

function Home() {

  // [variable de estado, funcion para setera la variable de estado] = useState(valor inicial)
  const [selectedNft, setSelectedNft] = useState(-1);
  const [formStatus, setFormStatus] = useState("default");
  const [buttonDisabledStatus, setButtonDisabledStatus] = useState(false);
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  // Le decimos a React que ejecute loadNFTs cada vez que se haga un renderizado
  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    setLoadingState('not-loaded')
    /* create a generic provider and query for unsold market items */
    // const provider = new ethers.providers.JsonRpcProvider()
    const provider = new ethers.providers.JsonRpcProvider(mumbaiRpcUrl)
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, provider)
    const data = await contract.fetchMarketItems()

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
        seller: i.seller,
        owner: i.owner,
        image: imageUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/"),
        name: metadata.data.name,
        description: metadata.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }
  
  async function buyNft(nft, index) {
    setSelectedNft(index);
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    setButtonDisabledStatus(true)
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    setFormStatus("wallet")   
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price
    })
    setFormStatus("blockchain")
    await transaction.wait()
    setSelectedNft(-1);
    setButtonDisabledStatus(false)
    setFormStatus("default")
    loadNFTs()
  }  

  if(loadingState === 'not-loaded') return (
    <div className="d-flex justify-content-center">
      <div className="spinner-border text-primary" role="status"></div>
    </div>)
  if (loadingState === 'loaded' && !nfts.length) return (<h1>No hay objetos en el marketplace</h1>)

  return (
    <>
      <h1>NFTs a la venta</h1>
      <p>NFTs disponibles para comprar en este marketplace.</p>
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
                  <button className="btn btn-primary w-100" onClick={() => buyNft(nft,i)} disabled={buttonDisabledStatus}>

                  {(() => {
                    if(i === selectedNft){
                      switch (formStatus) {
                        case 'default':
                          return <BtnDefault />
                        case 'wallet':
                          return <BtnWallet />
                        case 'blockchain':
                          return <BtnBlockchain />
                        default:
                          return null
                      }
                    }
                    else{
                      return <BtnDefault />
                    }
                  })()}


                  </button>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </>
  );  
}

export default Home;



function BtnDefault(){
  return(
    <>
      Comprar
    </>
  )
}

function BtnWallet(){
  return(
    <>
      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span className="sr-only">Billetera...</span>
    </>
  )
}

function BtnBlockchain(){
  return(
    <>
      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span className="sr-only">Transacción...</span>
    </>
  )
}