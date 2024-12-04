import { useState, useEffect } from 'react';
import './App.css';
import { ethers } from "ethers";
import incrementContract from "./Increment.json";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [count, setCount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const contractAddress = "0x4374f450fE7B196AB6999AB80Fc10b6529C49a4b"
  const contractABI = incrementContract.abi;

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Chain ID for Sepolia in hex
      });
      setIsWrongNetwork(false);
      await connectWallet();
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'SEP',
                decimals: 18
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          });
        } catch (addError) {
          console.error("Failed to add Sepolia network:", addError);
        }
      }
      console.error("Failed to switch to Sepolia network:", switchError);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access first
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Check if we're on Sepolia
        const network = await provider.getNetwork();
        if (network.chainId !== 11155111n) {
          setIsWrongNetwork(true);
          return; // Exit early if wrong network
        }
        setIsWrongNetwork(false);
        
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);

        // Instantiate the contract
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);

        // Fetch current count on chain
        const currentCount = await contractInstance.getCount();
        setCount(currentCount.toString());
      } catch (error) {
        console.error("Error connecting to wallet or contract:", error);
        if (error.code === 4001) {
          // User rejected the connection
          alert("Please connect your wallet to continue.");
        } else {
          alert(error.message);
        }
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
      // Listen for account changes
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

      // Listen for network changes
      window.ethereum.on('chainChanged', (_chainId) => {
        // Handle the new chain
        // Recommended to reload the page, as per MetaMask's recommendation
        window.location.reload();
      });

      return () => {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
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
          {isWrongNetwork ? (
            <button onClick={switchToSepolia}>Switch to Sepolia Network</button>
          ) : (
            <>
              <p>Current Count: {count !== null ? count : "Loading..."}</p>
              <button onClick={incrementCount}>Increment Count</button>
              <button onClick={changeWallet}>Change Wallet</button>
            </>
          )}
        </>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default App;
