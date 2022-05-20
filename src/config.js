
  import WalletConnectProvider from "@walletconnect/web3-provider";
  
  export const marketplaceAddress = "0xf2029E30abA6D8F3521623590902EB08d0277fA8"
  export const mumbaiRpcUrl = "https://polygon-mumbai.infura.io/v3/e23c443f430248ebb595fbb35aa9f0a4"
  export const coinName = "MATIC"
  export const ipfsGateway = "https://ieyara.infura-ipfs.io"
  export const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        rpc: {
          80001: "https://rpc-mumbai.maticvigil.com"
        }
      }
    }
  };