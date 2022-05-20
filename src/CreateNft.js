import { useState } from 'react'
import { ethers } from 'ethers'
import axios from 'axios';
import FormData from 'form-data';
import Web3Modal from 'web3modal';

import { useNavigate } from "react-router-dom";

import {
    marketplaceAddress, coinName, providerOptions
} from './config'

import {
  pinata_api_key,
  pinata_api_secret
} from './pinata.config'

import NFTMarketplace from './artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'


function CreateNft() {

  const [file, setFile] = useState(null)  // Archivo que el usuario adjunta
  const [image, setImage] = useState(null)
  const [formInput, setFormInput] = useState({ price: '', name: '', description: '', selectedFile: null })
  const [formStatus, setFormStatus] = useState("default");
  const [buttonDisabledStatus, setButtonDisabledStatus] = useState(true);

  let navigate = useNavigate();
  const goHome = () => {
    navigate("/");
  };

  const updateFormInput = (formFields) => {
    setFormInput(formFields);
    console.log("formFields", formFields)
    // console.log("image", image)
    if(formFields.name.length === 0 || formFields.description.length === 0 || formFields.price.length === 0 || formFields.selectedFile === null){
      setButtonDisabledStatus(true)
    }
    else{
      setButtonDisabledStatus(false)
      console.log("Habilitamos boton")
    }
  }

  const selectFile = async (formFields) => {
    console.log("Archivo", formFields.selectedFile.target.files[0])
    if (formFields.selectedFile.target.files && formFields.selectedFile.target.files[0]) {
      setFile(formFields.selectedFile.target.files[0])
      setImage(URL.createObjectURL(formFields.selectedFile.target.files[0]));
      updateFormInput(formFields)
    }
  }

  const uploadToPinata = async () => {
    console.log('uploadToPinata: starting')

    // 1) Upload de file
    // initialize the form data
    let formData = new FormData()

    // append the file form data to 
    formData.append("file", file)

    let response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxContentLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data;boundary=${formData._boundary}`, 
          "pinata_api_key": pinata_api_key,
          "pinata_secret_api_key": pinata_api_secret
        }
      }
    )
    console.log('pinFileToIPFS: response', response)

    // 2) Upload JSON with metadata
    const metadata = {
      name: formInput.name,
      description: formInput.description,
      image: "ipfs://" + response.data.IpfsHash
    };


    response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          "pinata_api_key": pinata_api_key,
          "pinata_secret_api_key": pinata_api_secret
        }
      }
    )
    console.log('pinJSONToIPFS: response', response)

    // Devuelvo la ruta a la metadata
    return "ipfs://" + response.data.IpfsHash
    
  }

  const listNFTForSale = async (event) => {
    event.preventDefault()
    setButtonDisabledStatus(true)
    console.log("Paso 1: subimos a Pinata la imagen y la metadata");
    setFormStatus("uploading")
    const nftImage = await uploadToPinata();
    console.log("Paso 2: ya tenemos Pinata la imagen", nftImage);
    setFormStatus("wallet")
    const web3Modal = new Web3Modal({
      network: "mumbai", // optional
      cacheProvider: false, // optional
      providerOptions // required
    });
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    console.log("Paso 3: ya hemos firmado la transaccion");

    /* create the NFT */
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    console.log("Paso 4: llamamos a la funcion de creacion del token y esperamos");
    let transaction = await contract.createToken(nftImage, price, { value: listingPrice })
    setFormStatus("blockchain")
    await transaction.wait()

    console.log("Paso 5: fin");
    setButtonDisabledStatus(false)
    goHome();
    
}
  return (
    <>
      <h1>Crear un NFT</h1>
      <form>
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Nombre</label>
          <div className="col-sm-10">
            <input 
              placeholder="Nombre del objeto"
              className="form-control"
              id="inputEmail3"
              onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
            />
          </div>
        </div>
        <div className="row mb-3">
          <label className="col-sm-2 col-form-label">Descripción</label>
          <div className="col-sm-10">      
            <textarea
              placeholder="Descripción del objeto"
              className="form-control"
              id="inputDesc3"
              rows="3"
              onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
            />
          </div>
        </div>
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
              {
                image !== null && (
                  <img src={image} alt="NFT" className="img-thumbnail"/>
                )
              }
              <input
                type="file"
                name="Asset"
                className="form-control"
                id="inputFile3"
                onChange={e => selectFile({ ...formInput, selectedFile: e })}
              />
          </div>
        </div>
        <button onClick={e => listNFTForSale(e)} className="btn btn-primary" disabled={buttonDisabledStatus}>

        {(() => {
          switch (formStatus) {
            case 'default':
              return <BtnDefault />
            case 'uploading':
              return <BtnUploading />
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
  );
}

export default CreateNft;

function BtnDefault(){
  return(
    <>
      Crear NFT
    </>
  )
}

function BtnUploading(){
  return(
    <>
      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      <span className="sr-only"> Subiendo imagen y metadata a Pinata...</span>
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