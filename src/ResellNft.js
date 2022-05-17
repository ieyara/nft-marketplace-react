/* pages/resell-nft.js */
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useSearchParams } from 'react-router-dom'
import Web3Modal from 'web3modal'

import { useNavigate } from "react-router-dom";

import {
  marketplaceAddress, coinName
} from './config'

import NFTMarketplace from './artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

function ResellNft() {

    const [formInput, setFormInput] = useState({ price: '' })
    
    const [formStatus, setFormStatus] = useState("default");
    const [buttonDisabledStatus, setButtonDisabledStatus] = useState(true);
    // eslint-disable-next-line
    const [searchParams, setSearchParams] = useSearchParams();
  
    const nftId = searchParams.get("id");
    const nftImage = searchParams.get("image");

    let navigate = useNavigate();
    const goBack = () => {
      navigate("/my-nfts");
    };

    useEffect(() => {
        fetchNFT()
    }, [nftId])

    async function fetchNFT() {
        // Nada que hacer. Tengo todos los datos
    }    

    const updateFormInput = (formFields) => {
      setFormInput(formFields);
      console.log("formFields", formFields)
      // console.log("image", image)
      if(formFields.price.length === 0){
        setButtonDisabledStatus(true)
      }
      else{
        setButtonDisabledStatus(false)
        console.log("Habilitamos boton")
      }
    }
    
    async function listNFTForSale(event) {
        if (!formInput.price) return // Deberia controlar mejor esto
        event.preventDefault()
        setButtonDisabledStatus(true)

        setFormStatus("wallet")
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
    
        const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
        let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
        let listingPrice = await contract.getListingPrice()
    
        listingPrice = listingPrice.toString()
        let transaction = await contract.resellToken(nftId, priceFormatted, { value: listingPrice })
        
        setFormStatus("blockchain")
        await transaction.wait()

        setButtonDisabledStatus(false)
        goBack();
        
    }

    return (
    <>
      <h1>Poner a la venta este NFT</h1>
      <form>
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Precio ({coinName})</label>
          <div className="col-sm-10">
              <input
                placeholder="Precio del objeto"
                className="form-control"
                id="inputPrice3"
                onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
              />
          </div>
        </div>
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Imagen</label>
          <div className="col-sm-10">                  
              <img src={nftImage} alt="NFT" className="img-thumbnail"/>
          </div>
        </div>
        <button onClick={e => listNFTForSale(e)} className="btn btn-primary" disabled={buttonDisabledStatus}>

        {(() => {
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
        })()}

        </button>
      </form>
    </>
    )
}

export default ResellNft;

function BtnDefault(){
  return(
    <>
      Poner a la venta
    </>
  )
}

function BtnWallet(){
  return(
    <>
      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span className="sr-only"> Interactuando con la billetera...</span>
    </>
  )
}

function BtnBlockchain(){
  return(
    <>
      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span className="sr-only"> Esperando a la confirmación de la transacción...</span>
    </>
  )
}