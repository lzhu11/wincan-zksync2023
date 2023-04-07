import React,{ useEffect,useState } from 'react';
import './App.css';
import contract from './contracts/NFTCollectible.json';
import { ethers } from 'ethers';


console.log(contract)
const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider);
// const contractAddress = "0x5F7959A124C44fa8E352ed614d245305781E6153";  //失敗的bayc，因為多加了extension
// const contractAddress = "0xaE0714715702991ee63fdb59BDd9e6E00F48b46d";    bayc
const contractAddress = "0x408fB96D4ca495DD660a7a3cEf382653c9e0f287";
const abi = contract;
console.log("line09"+abi);
var networkid = 5;

function App() {

  const [currentAccount, setCurrentAccount] = useState(null);


  const checkWalletIsConnected = async() => { 
    const { ethereum } = window;

    if (!ethereum){
      console.log("make sure you have metamask installed!");
      return;
    }else{
      console.log(+"wallet exists! we are ready to go!");
    }

    const accounts = await ethereum.request({method:'eth_accounts'});

    if (accounts.length !== 0){
      const account = accounts[0];
      console.log("found an authorized account: ",account);
      setCurrentAccount(account);
    }else{
      console.log("no authorized account found");
    }
    ethereum.on('accountsChanged', (accounts1) =>{
      accounts[0] = accounts1;
      console.log(accounts[0]);
    })
    ethereum.on('networkChanged', (networkid1)=> {
      networkid = networkid1;
      console.log(networkid);
    })
    if (window.ethereum.netWorkVersion !== 5){
      try{
        window.ethereum.request({
          method:'wallet_switchEthereumChain',
          params:[{chainId:web3.utils.toHex(5)}]
        });
      }
      catch (err){
        if(err.code === 4902){
          window.ethereum.request({
            method:'wallet_switchEthereumChain',
            params:[{
              chainName:'Goerli Testnet',
              chainId:web3.utils.toHex(5),
              nativeCurrency:{
                name:'Goerli',
                decimals:18,
                symbol:'ETH'
              },
              rpcUrls:['https://eth-goerli.g.alchemy.com/v2/[YOUR-API-KEY']
            }]
          });
        }
      }
    }
  }

  const connectWalletHandler = async() => {
    const { ethereum } = window;
    
    if(!ethereum){
      alert("please install metamask!");
    }

    try{
      const accounts = await ethereum.request({method: 'eth_requestAccounts'});
      console.log("found an account! address: ",accounts[0]);
      setCurrentAccount(accounts[0]);
    }catch(err){
      console.log(err)
    }
   }

  const mintNftHandler = async() => {
    try{
      const {ethereum} = window;

      if(!ethereum){
        console.log("ethereum object does not exist");
      }else{
        if (window.ethereum.netWorkVersion !== 5){
          try{
            window.ethereum.request({
              method:'wallet_switchEthereumChain',
              params:[{chainId:web3.utils.toHex(5)}]
            });
          }
          catch (err){
            if(err.code === 4902){
              window.ethereum.request({
                method:'wallet_switchEthereumChain',
                params:[{
                  chainName:'Goerli Testnet',
                  chainId:web3.utils.toHex(5),
                  nativeCurrency:{
                    name:'Goerli',
                    decimals:18,
                    symbol:'ETH'
                  },
                  rpcUrls:['https://eth-goerli.g.alchemy.com/v2/[YOUR-API-KEY']
                }]
              });
            }
          }
        }
        document.getElementById("cta-button mint-nft-button").disabled = true;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        // const nftContract = new ethers.Contract(contractAddress, abi ,signer);
        const nftContract = new ethers.Contract(contractAddress,abi,signer);
        console.log("initialize payment");
        let nftTxn = await nftContract.safeMint();
        alert("Mining...please wait!");

        console.log("Mining...please wait!");
        await nftTxn.wait();

        console.log(`Mined, see transaction : https://goerli.etherscan.io/tx/${nftTxn.hash}`);
        document.getElementById("cta-button mint-nft-button").disabled = false;
        alert(`Mined, see transaction : https://goerli.etherscan.io/tx/${nftTxn.hash}`);
      }
    }catch(err){
      console.log(err);
      alert("mint failed");
    }
  }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const mintNftButton = () => {
    return (
      <button onClick={mintNftHandler} className='cta-button mint-nft-button' id='cta-button mint-nft-button'>
        Mint NFT
      </button>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
    <div className='main-app'>
      <h1>MINT NFT!!</h1>
      <div>
        {currentAccount ? mintNftButton() : connectWalletButton()}
      </div>
    </div>
  )
}

export default App;