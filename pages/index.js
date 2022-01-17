import { ethers } from 'ethers'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from "uuid";
import styles from '../styles/Home.module.css'

import { makeContract } from '../utils/helpers'

export default function Home() {

  const [loginState, setLoginState] = useState(null)
  const [isProcess, setIsProcess] = useState(false)
  const [contractAddress, setContractAddress] = useState('')

  const connectWallet = async (e) => {
    e.preventDefault()
    setLoginState('Connecting to your wallet')

    if (!window.ethereum) {
      setLoginState('No metamask detected!!')
      return
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('wallet_requestPermissions', [{
      'eth_accounts': {},
    }])
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner();
    const walletAddress = await signer.getAddress();

    console.log('walletAddress', walletAddress)

    const nonce = uuidv4()

    const { chainId } = await provider.getNetwork()

    const signature = await signer.signMessage("Login to Website");
    console.log('signature', signature)

    setLoginState('Wallet Address: ' + walletAddress.substring(0,9) + '... chainId: ' + chainId)
  }

  const disconnectWallet = async (e) => {
    e.preventDefault();

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.removeAllListeners()
    provider = null;
  

    setLoginState('');
  }

  const switchNetwork = async () => {
    if (!window.ethereum) {
      return
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const { chainId } = await provider.getNetwork()

    if (chainId !== 97) {
      await provider.send('wallet_switchEthereumChain', [{
        'chainId': '0x61',
      }])
    }
  }

  const getCurrentWallet = async () => {

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const walletAddress = await signer.getAddress();
    const { chainId } = await provider.getNetwork()

    console.log('walletAddress', walletAddress)
    setLoginState('Wallet Address: ' + walletAddress.substring(0,9) + '... chainId: ' + chainId)
  }

  const deployContract = async () => {
    setIsProcess(true)
    const output = await makeContract();
    console.log('output', output)

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const factory = new ethers.ContractFactory(output.data.abi, output.data.bytecode, signer)
    let contract;

    try {
      const adminAddress = '0x452fCE7eA516470F5107079ede234805395c305E'
      contract = await factory.deploy(adminAddress);
      await contract.deployTransaction.wait();
    } catch (error) {
      setLoginState('Deployment Failed');
      console.log(error);
      setIsProcess(false)
      return;
    }

    if (contract.address === undefined) {
      setLoginState('Deployment Failed');
      setIsProcess(false)
      return;
    }

    console.log('contract', contract)
    setContractAddress(contract.address)
    setIsProcess(false)
  }

  const createContract = async () => {

  }

  const buttonstyled = {
    padding: '20px',
    fontSize: '1.5em',
    color: '#0000ff',
    margin: '0 5px',
    cursor: 'pointer'
  }

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    provider.on("network", (newNetwork, oldNetwork) => {
        if (newNetwork.chainId != 97) {
          switchNetwork()
        }
    });

    getCurrentWallet()
  }, [])

  function createMarkup() {
    return {__html: '<a href="#">test</a>'};
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome 
        </h1>

        <h4 className={styles.description}>
          { loginState }
        </h4>

        { contractAddress !== '' ? 
          <h3>Deploy Completed Contract Address { contractAddress }</h3> 
        : <></>}

        <div className={styles.grid}>
          <button onClick={ connectWallet } style={ buttonstyled }>Connect Wallet</button> 
          {/* <button onClick={ disconnectWallet } style={ buttonstyled }>Disconnect Wallet</button> 
          <button onClick={ getCurrentWallet } style={ buttonstyled }>Get Current Wallet</button>  */}
        </div>

        <br/><br/>

        <div className={styles.grid}>
          {/* <button onClick={ createContract } style={ buttonstyled }>Make Contract</button>  */}
          <button onClick={ deployContract } style={ buttonstyled } disabled={isProcess}>Deploy Contract ERC20.sol</button> 
        </div>

      </main>
    </div>
  )
}