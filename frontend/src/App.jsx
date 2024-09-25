import { useState } from 'react';
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
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default App;
