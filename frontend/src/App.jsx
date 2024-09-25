import { useState, useEffect } from 'react';
import './App.css';
import { ethers } from "ethers";
import incrementContract from "./Increment.json";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [count, setCount] = useState(null);
  const [contract, setContract] = useState(null);
  const contractAddress = "0x4374f450fE7B196AB6999AB80Fc10b6529C49a4b"
  const contractABI = incrementContract.abi;

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();  // Await the getSigner method
        const address = await signer.getAddress();  // Now this should work
        setWalletAddress(address);

        // Instantiate the contract
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);

        // Fetch current count on chain
        const currentCount = await contractInstance.getCount();
        setCount(currentCount.toString());
      } catch (error) {
        console.error("Error connecting to wallet or contract:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it to use this feature.");
    }
  };

  // Function to change wallet manually
  const changeWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
        await connectWallet(); // Reconnect after changing wallets
      } catch (error) {
        console.error("Error changing wallet:", error);
      }
    }
  };

  // Listen to MetaMask account change events
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          connectWallet();
        } else {
          setWalletAddress(null);
          setCount(null);
          setContract(null);
        }
      });

      return () => {
        window.ethereum.removeListener('accountsChanged', () => {});
      };
    }
  }, []);

  const incrementCount = async () => {
    if (contract) {
      try {
        const tx = await contract.increment();
        await tx.wait();

        // Fetch new count on chain
        const newCount = await contract.getCount();
        setCount(newCount.toString());
      } catch (error) {
        console.error("Error incrementing count:", error);
      }
    }
  }

  return (
    <div className="App">
      <h1>Increment Smart Contract</h1>
      {walletAddress ? (
        <>
          <p>Connected Wallet Address: {walletAddress}</p>
          <p>Current Count: {count !== null ? count : "Loading..."}</p>
          <button onClick={incrementCount}>Increment Count</button>
          <button onClick={changeWallet}>Change Wallet</button>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default App;
