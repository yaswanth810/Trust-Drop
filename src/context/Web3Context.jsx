import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import TrustDropABI from '../abi/TrustDrop.json';

const Web3Context = createContext(null);

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [networkName, setNetworkName] = useState('');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  const initializeContract = useCallback(async (signerInstance) => {
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      console.warn('Contract address not set. Please deploy the contract and update .env');
      return null;
    }
    const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, TrustDropABI.abi, signerInstance);
    setContract(contractInstance);
    return contractInstance;
  }, []);

  const updateBalance = useCallback(async (providerInstance, address) => {
    try {
      const bal = await providerInstance.getBalance(address);
      setBalance(ethers.formatEther(bal));
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use TrustDrop!');
      return;
    }

    try {
      setLoading(true);

      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Switch to Sepolia
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError) {
        // If Sepolia is not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Testnet',
              nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
        }
      }

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signerInstance = await browserProvider.getSigner();
      const address = accounts[0];

      setProvider(browserProvider);
      setSigner(signerInstance);
      setAccount(address);
      setIsConnected(true);
      setNetworkName('Sepolia Testnet');

      await updateBalance(browserProvider, address);
      await initializeContract(signerInstance);
    } catch (err) {
      console.error('Error connecting wallet:', err);
    } finally {
      setLoading(false);
    }
  }, [initializeContract, updateBalance]);

  // Listen for account/network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setIsConnected(false);
        setContract(null);
      } else {
        setAccount(accounts[0]);
        if (provider) {
          updateBalance(provider, accounts[0]);
        }
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check if already connected
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
      if (accounts.length > 0) {
        connectWallet();
      }
    });

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const value = {
    account,
    provider,
    signer,
    contract,
    connectWallet,
    isConnected,
    networkName,
    balance,
    loading,
    contractAddress: CONTRACT_ADDRESS,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

export default Web3Context;
