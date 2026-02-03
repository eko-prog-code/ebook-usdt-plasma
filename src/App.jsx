import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import './App.css';
import coverBook from './assets/coverbook.jpg';

/* ================= CONFIG - PLASMA MAINNET ================= */
const CONTRACT_ADDRESS = "0x00449A19b848C436b21900b462309f3B3ea249FB";
const USDT_ADDRESS = "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb";
const WHATSAPP_NUMBER = "62895600394345"; // Admin WhatsApp number

const PLASMA_CHAIN_ID = 9745;
const PLASMA_RPC_URL = "https://rpc.plasma.to"; // Updated working RPC
const PLASMA_EXPLORER = "https://plasmascan.to";
const PLASMA_NETWORK_NAME = "Plasma Mainnet";
const PLASMA_CURRENCY_SYMBOL = "XPL";

/* ================= ABI ================= */
const CONTRACT_ABI = [
  // Owner functions
  {
    "inputs": [
      { "internalType": "uint256", "name": "_id", "type": "uint256" },
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_description", "type": "string" },
      { "internalType": "uint256", "name": "_price", "type": "uint256" },
      { "internalType": "uint256", "name": "_discount", "type": "uint256" }
    ],
    "name": "publishEbook",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_tokenAddress", "type": "address" }
    ],
    "name": "rescueToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // User functions
  {
    "inputs": [
      { "internalType": "uint256", "name": "_ebookId", "type": "uint256" },
      { "internalType": "string", "name": "_buyerName", "type": "string" },
      { "internalType": "string", "name": "_whatsappNumber", "type": "string" }
    ],
    "name": "purchaseEbook",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // View functions - Updated with proper return types
  {
    "inputs": [],
    "name": "getAvailableEbooks",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "uint256", "name": "discount", "type": "uint256" },
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "bool", "name": "isPublished", "type": "bool" },
          { "internalType": "bool", "name": "isSold", "type": "bool" }
        ],
        "internalType": "struct PlasmaEbookUSDT.Ebook[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllPurchases",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "ebookId", "type": "uint256" },
          { "internalType": "address", "name": "buyer", "type": "address" },
          { "internalType": "string", "name": "buyerName", "type": "string" },
          { "internalType": "string", "name": "whatsappNumber", "type": "string" },
          { "internalType": "uint256", "name": "amountPaid", "type": "uint256" },
          { "internalType": "uint256", "name": "purchaseTime", "type": "uint256" }
        ],
        "internalType": "struct PlasmaEbookUSDT.Purchase[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // Individual view functions
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "ebooks",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "price", "type": "uint256" },
      { "internalType": "uint256", "name": "discount", "type": "uint256" },
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "bool", "name": "isPublished", "type": "bool" },
      { "internalType": "bool", "name": "isSold", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "purchases",
    "outputs": [
      { "internalType": "uint256", "name": "ebookId", "type": "uint256" },
      { "internalType": "address", "name": "buyer", "type": "address" },
      { "internalType": "string", "name": "buyerName", "type": "string" },
      { "internalType": "string", "name": "whatsappNumber", "type": "string" },
      { "internalType": "uint256", "name": "amountPaid", "type": "uint256" },
      { "internalType": "uint256", "name": "purchaseTime", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // Constants and info
  {
    "inputs": [],
    "name": "MAX_EBOOKS",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "USDT_ADDRESS",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "publishedCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const USDT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
];

/* ================= PLASMA NETWORK CONFIG ================= */
const plasmaNetwork = {
  chainId: `0x${PLASMA_CHAIN_ID.toString(16)}`,
  chainName: PLASMA_NETWORK_NAME,
  nativeCurrency: {
    name: PLASMA_CURRENCY_SYMBOL,
    symbol: PLASMA_CURRENCY_SYMBOL,
    decimals: 18
  },
  rpcUrls: [PLASMA_RPC_URL],
  blockExplorerUrls: [PLASMA_EXPLORER]
};

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [networkName, setNetworkName] = useState('');
  const [networkStatus, setNetworkStatus] = useState('disconnected');

  // State untuk ebook
  const [ebooks, setEbooks] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [contractBalance, setContractBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // State untuk form publish ebook
  const [ebookForm, setEbookForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    discount: 0
  });

  // State untuk form pembelian per ebook
  const [purchaseForms, setPurchaseForms] = useState({});

  // State untuk wallet dan modal
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  
  // State baru untuk modal Review Ebook
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState(null);

  // Debug state
  const [debugInfo, setDebugInfo] = useState({});

  // Helper function untuk safe contract calls
  const safeContractCall = useCallback(async (contractInstance, methodName, args = [], options = {}) => {
    try {
      console.log(`Calling ${methodName} with args:`, args);
      const result = await contractInstance[methodName](...args);
      console.log(`${methodName} result:`, result);
      return { success: true, data: result };
    } catch (error) {
      console.error(`Error calling ${methodName}:`, error);
      return {
        success: false,
        error: error.message,
        code: error.code,
        shortMessage: error.reason || error.message.split('\n')[0]
      };
    }
  }, []);

  // Initialize provider and check network
  useEffect(() => {
    const initApp = async () => {
      // Always try to load ebooks even without wallet
      await loadEbooksPublic();

      if (window.ethereum) {
        try {
          setNetworkStatus('connecting');

          // Test network connection
          const testProvider = new ethers.JsonRpcProvider(PLASMA_RPC_URL, PLASMA_CHAIN_ID);
          try {
            await testProvider.getBlockNumber();
            console.log("Network connection successful");
            setNetworkStatus('connected');
          } catch (networkError) {
            console.warn("Network connection failed:", networkError);
            setNetworkStatus('failed');
          }

          // Setup browser provider
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);

          // Check current network
          await checkNetwork();

          // Check wallet connection
          await checkWalletConnection();

        } catch (error) {
          console.error("Error initializing app:", error);
          setNetworkStatus('error');
        }
      } else {
        setNetworkStatus('no-wallet');
      }
    };

    initApp();

    // Event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Initialize contracts when provider and account are ready
  useEffect(() => {
    if (provider && account) {
      initContracts();
    }
  }, [provider, account]);

  // Load data when contract is ready
  useEffect(() => {
    if (contract) {
      loadEbooks();
      if (isOwner) {
        loadPurchases();
        loadContractBalance();
      }
    }
  }, [contract, isOwner]);

  const handleAccountsChanged = (accounts) => {
    console.log('Accounts changed:', accounts);
    if (accounts.length === 0) {
      // Wallet disconnected
      setAccount(null);
      setSigner(null);
      setContract(null);
      setIsOwner(false);
      setPurchases([]);
      setPurchaseForms({});
    } else {
      setAccount(accounts[0]);
      // Contracts will be re-initialized via useEffect
    }
  };

  const handleChainChanged = (chainId) => {
    console.log('Chain changed:', chainId);
    window.location.reload();
  };

  const checkNetwork = async () => {
    if (!window.ethereum) return;

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);

      console.log('Current chain ID:', currentChainId, 'Expected:', PLASMA_CHAIN_ID);

      if (currentChainId !== PLASMA_CHAIN_ID) {
        setIsWrongNetwork(true);
        setNetworkName(`Chain ID: ${currentChainId}`);
      } else {
        setIsWrongNetwork(false);
        setNetworkName(PLASMA_NETWORK_NAME);
      }
    } catch (error) {
      console.error("Error checking network:", error);
    }
  };

  const switchToPlasmaNetwork = async () => {
    try {
      setIsLoading(true);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: plasmaNetwork.chainId }],
      });
      setIsWrongNetwork(false);
      setShowNetworkModal(false);
      window.location.reload();
    } catch (switchError) {
      console.error("Switch error:", switchError);
      // If network not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [plasmaNetwork],
          });
          window.location.reload();
        } catch (addError) {
          console.error("Error adding network:", addError);
          alert(`Please add ${PLASMA_NETWORK_NAME} manually:\n\nRPC URL: ${PLASMA_RPC_URL}\nChain ID: ${PLASMA_CHAIN_ID}\nCurrency Symbol: ${PLASMA_CURRENCY_SYMBOL}`);
        }
      } else {
        alert(`Failed to switch network: ${switchError.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkWalletConnection = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      console.log('Connected accounts:', accounts);

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner();
        setSigner(web3Signer);
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);

      if (!window.ethereum) {
        alert('Please install MetaMask or another Ethereum wallet!');
        return;
      }

      // Check network first
      await checkNetwork();
      if (isWrongNetwork) {
        setShowWalletModal(false);
        setShowNetworkModal(true);
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);

      setShowWalletModal(false);
      console.log('Wallet connected:', accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert('Failed to connect wallet: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const initContracts = async () => {
    if (!window.ethereum || !account) return;

    try {
      console.log('Initializing contracts...');

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();

      // Initialize contracts with signer for write operations
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        web3Signer
      );

      const usdtInstance = new ethers.Contract(
        USDT_ADDRESS,
        USDT_ABI,
        web3Signer
      );

      setContract(contractInstance);
      setUsdtContract(usdtInstance);

      // Check if user is owner
      try {
        const contractOwner = await contractInstance.owner();
        const isContractOwner = contractOwner.toLowerCase() === account.toLowerCase();
        console.log('Contract owner:', contractOwner, 'Is owner?', isContractOwner);
        setIsOwner(isContractOwner);
      } catch (ownerError) {
        console.error("Error checking owner:", ownerError);
        setIsOwner(false);
      }

      console.log('Contracts initialized successfully');
    } catch (error) {
      console.error("Error initializing contracts:", error);
      alert('Failed to initialize contracts: ' + error.message);
    }
  };

  // Fungsi untuk membuka modal Review Ebook
  const openReviewModal = (ebook) => {
    setSelectedEbook(ebook);
    setShowReviewModal(true);
  };

  // Fungsi untuk menutup modal Review Ebook
  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedEbook(null);
  };

  // Fungsi baru untuk load ebooks tanpa wallet (public)
  const loadEbooksPublic = async () => {
    try {
      setIsLoading(true);
      console.log('Loading ebooks (public mode)...');

      // Create read-only provider without wallet
      const readOnlyProvider = new ethers.JsonRpcProvider(PLASMA_RPC_URL, PLASMA_CHAIN_ID);
      const readOnlyContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        readOnlyProvider
      );

      let availableEbooks = [];

      // Try the optimized function first
      const result = await safeContractCall(readOnlyContract, 'getAvailableEbooks');

      if (result.success) {
        console.log('Got ebooks via getAvailableEbooks:', result.data);
        availableEbooks = result.data;
      } else {
        console.warn('Fallback to individual ebook calls:', result.error);

        // Fallback: check each ID individually
        availableEbooks = [];
        const maxEbooksResult = await safeContractCall(readOnlyContract, 'MAX_EBOOKS');
        const MAX_EBOOKS = maxEbooksResult.success ? Number(maxEbooksResult.data) : 10;

        for (let i = 1; i <= MAX_EBOOKS; i++) {
          try {
            const ebookResult = await safeContractCall(readOnlyContract, 'ebooks', [i]);
            if (ebookResult.success && ebookResult.data && ebookResult.data.isPublished) {
              availableEbooks.push(ebookResult.data);
            }
          } catch (e) {
            console.log(`Error fetching ebook ${i}:`, e.message);
            continue;
          }
        }
      }

      // Format the ebooks
      const formattedEbooks = availableEbooks.map(ebook => {
        // Handle different response structures
        const id = ebook.id ? Number(ebook.id) : (ebook[0] ? Number(ebook[0]) : 0);
        const name = ebook.name || ebook[1] || `Ebook #${id}`;
        const description = ebook.description || ebook[2] || 'No description available';
        const price = ebook.price || ebook[3] || 0;
        const discount = ebook.discount || ebook[4] || 0;
        const isPublished = ebook.isPublished || ebook[6] || false;
        const isSold = ebook.isSold || ebook[7] || false;
        const owner = ebook.owner || ebook[5] || '0x0';

        return {
          id,
          name,
          description,
          price: ethers.formatUnits(price, 6),
          discount: Number(discount),
          isPublished,
          isSold,
          owner
        };
      }).filter(ebook => ebook.isPublished); // Filter only published ebooks

      console.log('Formatted ebooks (public):', formattedEbooks);
      setEbooks(formattedEbooks);

      // Initialize purchase forms for each ebook
      const initialForms = {};
      formattedEbooks.forEach(ebook => {
        if (!ebook.isSold) {
          initialForms[ebook.id] = {
            buyerName: '',
            whatsappNumber: '',
            isProcessing: false
          };
        }
      });
      setPurchaseForms(initialForms);

      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        ebooksLoaded: formattedEbooks.length,
        lastEbookLoad: new Date().toISOString(),
        mode: 'public'
      }));

    } catch (error) {
      console.error("Error in loadEbooksPublic:", error);
      // Don't show alert in public mode to avoid disturbing users
    } finally {
      setIsLoading(false);
    }
  };

  const loadEbooks = async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      console.log('Loading ebooks (with wallet)...');

      let availableEbooks = [];

      // Try the optimized function first
      const result = await safeContractCall(contract, 'getAvailableEbooks');

      if (result.success) {
        console.log('Got ebooks via getAvailableEbooks:', result.data);
        availableEbooks = result.data;
      } else {
        console.warn('Fallback to individual ebook calls:', result.error);

        // Fallback: check each ID individually
        availableEbooks = [];
        const maxEbooksResult = await safeContractCall(contract, 'MAX_EBOOKS');
        const MAX_EBOOKS = maxEbooksResult.success ? Number(maxEbooksResult.data) : 10;

        for (let i = 1; i <= MAX_EBOOKS; i++) {
          try {
            const ebookResult = await safeContractCall(contract, 'ebooks', [i]);
            if (ebookResult.success && ebookResult.data && ebookResult.data.isPublished) {
              availableEbooks.push(ebookResult.data);
            }
          } catch (e) {
            console.log(`Error fetching ebook ${i}:`, e.message);
            continue;
          }
        }
      }

      // Format the ebooks
      const formattedEbooks = availableEbooks.map(ebook => {
        // Handle different response structures
        const id = ebook.id ? Number(ebook.id) : (ebook[0] ? Number(ebook[0]) : 0);
        const name = ebook.name || ebook[1] || `Ebook #${id}`;
        const description = ebook.description || ebook[2] || 'No description available';
        const price = ebook.price || ebook[3] || 0;
        const discount = ebook.discount || ebook[4] || 0;
        const isPublished = ebook.isPublished || ebook[6] || false;
        const isSold = ebook.isSold || ebook[7] || false;
        const owner = ebook.owner || ebook[5] || '0x0';

        return {
          id,
          name,
          description,
          price: ethers.formatUnits(price, 6),
          discount: Number(discount),
          isPublished,
          isSold,
          owner
        };
      }).filter(ebook => ebook.isPublished); // Filter only published ebooks

      console.log('Formatted ebooks (with wallet):', formattedEbooks);
      setEbooks(formattedEbooks);

      // Initialize purchase forms for each ebook
      const initialForms = {};
      formattedEbooks.forEach(ebook => {
        if (!ebook.isSold) {
          initialForms[ebook.id] = {
            buyerName: '',
            whatsappNumber: '',
            isProcessing: false
          };
        }
      });
      setPurchaseForms(initialForms);

      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        ebooksLoaded: formattedEbooks.length,
        lastEbookLoad: new Date().toISOString(),
        mode: 'wallet'
      }));

    } catch (error) {
      console.error("Error in loadEbooks:", error);
      alert('Failed to load ebooks: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPurchases = async () => {
    if (!contract || !isOwner) return;

    try {
      console.log('Loading purchases...');

      let allPurchases = [];

      // Try the optimized function first
      const result = await safeContractCall(contract, 'getAllPurchases');

      if (result.success) {
        console.log('Got purchases via getAllPurchases:', result.data);
        allPurchases = result.data;
      } else {
        console.warn('Fallback to individual purchase calls:', result.error);

        // Fallback: check each ID individually
        allPurchases = [];
        const maxEbooksResult = await safeContractCall(contract, 'MAX_EBOOKS');
        const MAX_EBOOKS = maxEbooksResult.success ? Number(maxEbooksResult.data) : 10;

        for (let i = 1; i <= MAX_EBOOKS; i++) {
          try {
            const purchaseResult = await safeContractCall(contract, 'purchases', [i]);
            if (purchaseResult.success && purchaseResult.data && purchaseResult.data.buyer !== '0x0000000000000000000000000000000000000000') {
              allPurchases.push(purchaseResult.data);
            }
          } catch (e) {
            console.log(`Error fetching purchase ${i}:`, e.message);
            continue;
          }
        }
      }

      // Format purchases
      const formattedPurchases = allPurchases.map(purchase => {
        const ebookId = purchase.ebookId || purchase[0] || 0;
        const buyer = purchase.buyer || purchase[1] || '0x0';
        const buyerName = purchase.buyerName || purchase[2] || 'Anonymous';
        const whatsappNumber = purchase.whatsappNumber || purchase[3] || 'N/A';
        const amountPaid = purchase.amountPaid || purchase[4] || 0;
        const purchaseTime = purchase.purchaseTime || purchase[5] || 0;

        return {
          ebookId: Number(ebookId),
          buyer,
          buyerName,
          whatsappNumber,
          amountPaid: ethers.formatUnits(amountPaid, 6),
          purchaseTime: purchaseTime
            ? new Date(Number(purchaseTime) * 1000).toLocaleString()
            : 'Unknown'
        };
      });

      console.log('Formatted purchases:', formattedPurchases);
      setPurchases(formattedPurchases);

    } catch (error) {
      console.error("Error loading purchases:", error);
    }
  };

  const loadContractBalance = async () => {
    if (!contract) return;

    try {
      const result = await safeContractCall(contract, 'getContractBalance');
      if (result.success) {
        const balance = ethers.formatUnits(result.data, 6);
        setContractBalance(balance);
        console.log('Contract balance:', balance, 'USDT');
      }
    } catch (error) {
      console.error("Error loading contract balance:", error);
    }
  };

  const handlePublishEbook = async (e) => {
    e.preventDefault();
    if (!contract || !isOwner) return;

    try {
      setIsLoading(true);

      // Validate form
      if (!ebookForm.id || !ebookForm.name || !ebookForm.price) {
        alert('Please fill all required fields');
        return;
      }

      if (ebookForm.id < 1 || ebookForm.id > 10) {
        alert('Ebook ID must be between 1 and 10');
        return;
      }

      // Convert price to 6 decimals
      const priceInWei = ethers.parseUnits(ebookForm.price, 6);

      console.log('Publishing ebook with:', {
        id: ebookForm.id,
        name: ebookForm.name,
        description: ebookForm.description,
        price: priceInWei.toString(),
        discount: ebookForm.discount
      });

      const tx = await contract.publishEbook(
        ebookForm.id,
        ebookForm.name,
        ebookForm.description || '',
        priceInWei,
        ebookForm.discount
      );

      console.log('Transaction sent:', tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      alert('✅ Ebook published successfully!');

      // Reset form and close modal
      setEbookForm({
        id: '',
        name: '',
        description: '',
        price: '',
        discount: 0
      });
      setShowPublishModal(false);

      // Reload ebooks
      await loadEbooks();

    } catch (error) {
      console.error("Error publishing ebook:", error);
      alert('❌ Failed to publish ebook: ' + (error.reason || error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseEbook = async (ebookId) => {
    if (!contract || !usdtContract || !account) {
      alert('Please connect your wallet first!');
      setShowWalletModal(true);
      return;
    }

    const purchaseForm = purchaseForms[ebookId];
    if (!purchaseForm) return;

    try {
      // Set processing state for this specific ebook
      setPurchaseForms(prev => ({
        ...prev,
        [ebookId]: { ...prev[ebookId], isProcessing: true }
      }));

      // Find the ebook
      const ebook = ebooks.find(e => e.id === ebookId);
      if (!ebook) {
        alert('Ebook not found!');
        return;
      }

      if (ebook.isSold) {
        alert('This ebook has already been sold!');
        return;
      }

      // Validate form
      if (!purchaseForm.buyerName.trim()) {
        alert('Please enter your name');
        setPurchaseForms(prev => ({
          ...prev,
          [ebookId]: { ...prev[ebookId], isProcessing: false }
        }));
        return;
      }

      console.log('Purchasing ebook:', ebook);

      // Calculate final price
      const price = ethers.parseUnits(ebook.price, 6);
      const finalPrice = ebook.discount > 0
        ? (price * BigInt(100 - ebook.discount)) / BigInt(100)
        : price;

      console.log('Final price:', ethers.formatUnits(finalPrice, 6), 'USDT');

      // Check USDT balance
      const userBalance = await usdtContract.balanceOf(account);
      if (userBalance < finalPrice) {
        alert(`Insufficient USDT balance. You need ${ethers.formatUnits(finalPrice, 6)} USDT`);
        setPurchaseForms(prev => ({
          ...prev,
          [ebookId]: { ...prev[ebookId], isProcessing: false }
        }));
        return;
      }

      // Check allowance
      const allowance = await usdtContract.allowance(account, CONTRACT_ADDRESS);
      console.log('Current allowance:', ethers.formatUnits(allowance, 6), 'USDT');
      console.log('Required allowance:', ethers.formatUnits(finalPrice, 6), 'USDT');

      if (allowance < finalPrice) {
        // Approve USDT - add 10% buffer
        const approveAmount = (finalPrice * BigInt(110)) / BigInt(100);
        console.log('Approving:', ethers.formatUnits(approveAmount, 6), 'USDT');

        const approveTx = await usdtContract.approve(CONTRACT_ADDRESS, approveAmount);
        console.log('Approval transaction sent:', approveTx.hash);

        await approveTx.wait();
        console.log('Approval confirmed');
      }

      // Purchase ebook
      console.log('Purchasing with details:', {
        ebookId,
        buyerName: purchaseForm.buyerName.trim(),
        whatsappNumber: purchaseForm.whatsappNumber.trim() || "N/A"
      });

      const purchaseTx = await contract.purchaseEbook(
        ebookId,
        purchaseForm.buyerName.trim(),
        purchaseForm.whatsappNumber.trim() || "N/A"
      );

      console.log('Purchase transaction sent:', purchaseTx.hash);
      const receipt = await purchaseTx.wait();
      console.log('Purchase confirmed:', receipt);

      alert('✅ Ebook purchased successfully!');

      // Reset form for this ebook
      setPurchaseForms(prev => ({
        ...prev,
        [ebookId]: {
          buyerName: '',
          whatsappNumber: '',
          isProcessing: false
        }
      }));

      // Reload ebooks
      await loadEbooks();

    } catch (error) {
      console.error("Error purchasing ebook:", error);
      alert('❌ Failed to purchase ebook: ' + (error.reason || error.message || 'Unknown error'));

      // Reset processing state
      setPurchaseForms(prev => ({
        ...prev,
        [ebookId]: { ...prev[ebookId], isProcessing: false }
      }));
    }
  };

  const handleEmergencyWithdraw = async () => {
    if (!contract || !isOwner) return;

    if (!window.confirm('⚠️ Are you sure you want to withdraw ALL USDT from the contract?\n\nThis action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);

      console.log('Initiating emergency withdraw...');
      const tx = await contract.emergencyWithdraw();
      console.log('Withdraw transaction sent:', tx.hash);

      await tx.wait();
      console.log('Withdraw confirmed');

      alert('✅ All USDT withdrawn successfully!');
      setShowWithdrawModal(false);

      // Update contract balance
      await loadContractBalance();

    } catch (error) {
      console.error("Error withdrawing funds:", error);
      alert('❌ Failed to withdraw funds: ' + (error.reason || error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseFormChange = (ebookId, field, value) => {
    setPurchaseForms(prev => ({
      ...prev,
      [ebookId]: {
        ...prev[ebookId],
        [field]: value
      }
    }));
  };

  const formatAddress = (address) => {
    if (!address || address === '0x0' || address === '0x0000000000000000000000000000000000000000') {
      return 'N/A';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getAvailableEbookIds = () => {
    const usedIds = ebooks.map(ebook => ebook.id);
    return Array.from({ length: 10 }, (_, i) => i + 1)
      .filter(id => !usedIds.includes(id));
  };

  const whatsappLink = (number) => {
    if (!number || number === 'N/A') return '#';
    const cleanNumber = number.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}`;
  };

  const viewOnExplorer = (address) => {
    return `${PLASMA_EXPLORER}/address/${address}`;
  };

  const refreshData = async () => {
    if (contract && account) {
      await loadEbooks();
      if (isOwner) {
        await loadPurchases();
        await loadContractBalance();
      }
    } else {
      // If no wallet connected, use public mode
      await loadEbooksPublic();
    }
  };

  // Fungsi untuk memotong teks deskripsi agar tidak terlalu panjang di card
  const truncateDescription = (description, maxLength = 80) => {
    if (!description) return 'No description available';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <h1 className="logo">
                <span className="logo-plasma">Plasma</span>
                <span className="logo-ebook">Ebook</span>
                <span className="logo-usdt">USDT</span>
              </h1>
              <div className="network-info">
                {networkName && (
                  <div className={`network-badge ${isWrongNetwork ? 'wrong-network' : ''}`}>
                    {networkName}
                    {isWrongNetwork && <span className="network-warning"> ⚠️</span>}
                  </div>
                )}
                <div className="network-status">
                  Status: <span className={`status-${networkStatus}`}>{networkStatus}</span>
                </div>
              </div>
            </div>

            <div className="header-actions">
              {account ? (
                <div className="wallet-info">
                  <span className="wallet-address" title={account}>
                    {formatAddress(account)}
                  </span>
                  <button
                    className="btn btn-refresh"
                    onClick={refreshData}
                    disabled={isLoading}
                    title="Refresh data"
                  >
                    🔄
                  </button>
                  {isOwner && (
                    <>
                      <button
                        className="btn btn-owner"
                        onClick={() => setShowPublishModal(true)}
                        disabled={isWrongNetwork}
                      >
                        📖 Publish
                      </button>
                      {contractBalance !== '0' && (
                        <button
                          className="btn btn-withdraw-small"
                          onClick={() => setShowWithdrawModal(true)}
                          disabled={isWrongNetwork}
                        >
                          💰 Withdraw
                        </button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <button
                  className="btn btn-connect"
                  onClick={() => setShowWalletModal(true)}
                  disabled={!window.ethereum}
                >
                  {window.ethereum ? '🔗 Connect Wallet' : '⚠️ Install Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h2>Digital Ebooks Marketplace</h2>
            <p>Buy and sell ebooks with USDT on Plasma Network</p>

            <div className="hero-info">
              {/* Contract Address */}
              <div className="hero-info-item">
                <div className="hero-info-icon">📜</div>
                <div className="hero-info-content">
                  <span className="hero-info-label">Contract</span>
                  <a
                    href={viewOnExplorer(CONTRACT_ADDRESS)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-info-value"
                    title={CONTRACT_ADDRESS}
                  >
                    {formatAddress(CONTRACT_ADDRESS)}
                  </a>
                </div>
              </div>

              {/* USDT Address */}
              <div className="hero-info-item">
                <div className="hero-info-icon">💰</div>
                <div className="hero-info-content">
                  <span className="hero-info-label">USDT Token</span>
                  <a
                    href={viewOnExplorer(USDT_ADDRESS)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-info-value"
                    title={USDT_ADDRESS}
                  >
                    {formatAddress(USDT_ADDRESS)}
                  </a>
                </div>
              </div>

              {/* Contract Balance */}
              {contractBalance !== '0' && isOwner && (
                <div className="hero-info-item">
                  <div className="hero-info-icon">💎</div>
                  <div className="hero-info-content">
                    <span className="hero-info-label">Balance</span>
                    <div className="balance-amount">
                      {contractBalance}
                      <span className="hero-info-value">USDT</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main">
        <div className="container">
          {/* Network Warning */}
          {isWrongNetwork && (
            <div className="network-alert">
              <div className="alert-content">
                <div className="alert-icon">⚠️</div>
                <div className="alert-text">
                  <p><strong>Wrong Network</strong></p>
                  <p>You are connected to {networkName}. Please switch to {PLASMA_NETWORK_NAME}.</p>
                </div>
                <button
                  className="btn btn-switch"
                  onClick={switchToPlasmaNetwork}
                  disabled={isLoading}
                >
                  {isLoading ? 'Switching...' : `Switch to ${PLASMA_NETWORK_NAME}`}
                </button>
              </div>
            </div>
          )}

          {/* Ebooks Grid - SELALU TAMPIL TANPA PERLU WALLET */}
          <div className="ebooks-grid">
            <div className="section-header">
              <h2 className="section-title">Available Ebooks</h2>
              <div className="section-actions">
                <span className="ebooks-count">{ebooks.length} ebooks available</span>
                <button
                  className="btn btn-refresh-small"
                  onClick={refreshData}
                  disabled={isLoading}
                >
                  {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
                </button>
              </div>
            </div>

            {isLoading && ebooks.length === 0 ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading ebooks...</p>
              </div>
            ) : ebooks.length === 0 ? (
              <div className="no-ebooks">
                <div className="no-ebooks-icon">📚</div>
                <p>No ebooks available yet.</p>
                {isOwner && account ? (
                  <button
                    className="btn btn-owner"
                    onClick={() => setShowPublishModal(true)}
                  >
                    Publish Your First Ebook
                  </button>
                ) : (
                  <p className="connect-hint">Connect wallet as owner to publish ebooks</p>
                )}
              </div>
            ) : (
              <div className="grid">
                {ebooks.map(ebook => {
                  const purchaseForm = purchaseForms[ebook.id] || {};
                  const isProcessing = purchaseForm.isProcessing || false;

                  return (
                    <div key={ebook.id} className="ebook-card" data-id={ebook.id}>
                      <div className="ebook-cover">
                        <img src={coverBook} alt={ebook.name} />
                        {ebook.discount > 0 && (
                          <div className="discount-badge">-{ebook.discount}%</div>
                        )}
                        {ebook.isSold && (
                          <div className="sold-badge">SOLD</div>
                        )}
                      </div>

                      <div className="ebook-info">
                        <h3 className="ebook-title">{ebook.name}</h3>
                        
                        {/* Deskripsi singkat dengan tombol Review */}
                        <div className="ebook-description-container">
                          <p className="ebook-description">
                            {truncateDescription(ebook.description)}
                          </p>
                          <button
                            className="btn btn-review"
                            onClick={() => openReviewModal(ebook)}
                          >
                            📖 Review Ebook
                          </button>
                        </div>

                        <div className="ebook-price">
                          {ebook.discount > 0 ? (
                            <>
                              <span className="original-price">{ebook.price} USDT</span>
                              <span className="final-price">
                                {(Number(ebook.price) * (100 - ebook.discount) / 100).toFixed(2)} USDT
                              </span>
                            </>
                          ) : (
                            <span className="final-price">{ebook.price} USDT</span>
                          )}
                        </div>

                        <div className="ebook-meta">
                          <span className="ebook-id">ID: {ebook.id}</span>
                          <span className="ebook-status">
                            {ebook.isSold ? 'Sold' : 'Available'}
                          </span>
                        </div>

                        {!ebook.isSold ? (
                          <div className="purchase-form">
                            <div className="form-group">
                              <label htmlFor={`buyerName-${ebook.id}`}>Your Name *</label>
                              <input
                                id={`buyerName-${ebook.id}`}
                                type="text"
                                value={purchaseForm.buyerName || ''}
                                onChange={(e) => handlePurchaseFormChange(ebook.id, 'buyerName', e.target.value)}
                                placeholder="Enter your name"
                                disabled={isProcessing || isWrongNetwork}
                                required
                              />
                            </div>

                            <div className="form-group">
                              <label htmlFor={`whatsapp-${ebook.id}`}>WhatsApp Number (Optional)</label>
                              <input
                                id={`whatsapp-${ebook.id}`}
                                type="text"
                                value={purchaseForm.whatsappNumber || ''}
                                onChange={(e) => handlePurchaseFormChange(ebook.id, 'whatsappNumber', e.target.value)}
                                placeholder="Enter WhatsApp number"
                                disabled={isProcessing || isWrongNetwork}
                              />
                            </div>

                            <button
                              className={`btn btn-buy ${isProcessing ? 'processing' : ''}`}
                              onClick={() => handlePurchaseEbook(ebook.id)}
                              disabled={ebook.isSold || isProcessing || isWrongNetwork || !purchaseForm.buyerName?.trim()}
                              title={!account ? 'Connect wallet to purchase' : ''}
                            >
                              {!account ? 'Connect to Buy' : (isProcessing ? 'Processing...' : 'Buy Now')}
                            </button>
                          </div>
                        ) : (
                          <div className="sold-out-message">
                            <div className="sold-out-icon">✅</div>
                            <p>This ebook has been sold</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Owner Dashboard - Hanya tampil jika wallet terhubung dan user adalah owner */}
          {account && isOwner && purchases.length > 0 && (
            <div className="dashboard">
              <div className="dashboard-header">
                <h2 className="section-title">Purchase Dashboard</h2>
                <div className="dashboard-stats">
                  <span className="stat">Total Purchases: <strong>{purchases.length}</strong></span>
                  <span className="stat">Total Revenue: <strong>{contractBalance} USDT</strong></span>
                  <button
                    className="btn btn-withdraw"
                    onClick={() => setShowWithdrawModal(true)}
                    disabled={isWrongNetwork}
                  >
                    💰 Emergency Withdraw
                  </button>
                </div>
              </div>

              <div className="purchases-table-container">
                <div className="table-scroll">
                  <table className="purchases-table">
                    <thead>
                      <tr>
                        <th>Ebook ID</th>
                        <th>Buyer Address</th>
                        <th>Buyer Name</th>
                        <th>WhatsApp</th>
                        <th>Amount Paid</th>
                        <th>Purchase Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((purchase, index) => (
                        <tr key={index}>
                          <td>{purchase.ebookId}</td>
                          <td className="wallet-cell">
                            <a
                              href={viewOnExplorer(purchase.buyer)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={purchase.buyer}
                            >
                              {formatAddress(purchase.buyer)}
                            </a>
                          </td>
                          <td>{purchase.buyerName}</td>
                          <td>
                            {purchase.whatsappNumber !== 'N/A' ? (
                              <a
                                href={whatsappLink(purchase.whatsappNumber)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                📱 {purchase.whatsappNumber}
                              </a>
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td className="amount-cell">{purchase.amountPaid} USDT</td>
                          <td>{purchase.purchaseTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Connect Prompt untuk pembelian */}
          {!account && ebooks.some(ebook => !ebook.isSold) && (
            <div className="connect-prompt">
              <div className="connect-prompt-content">
                <div className="connect-icon">🔗</div>
                <div className="connect-text">
                  <p><strong>Want to purchase an ebook?</strong></p>
                  <p>Connect your wallet to complete your purchase</p>
                </div>
                <button
                  className="btn btn-connect btn-large"
                  onClick={() => setShowWalletModal(true)}
                >
                  Connect Wallet to Buy
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>PlasmaEbookUSDT &copy; 2024. Built on Plasma Network.</p>
          <p className="footer-links">
            <a href={viewOnExplorer(CONTRACT_ADDRESS)} target="_blank" rel="noopener noreferrer">
              View Contract
            </a>
            <a href={viewOnExplorer(USDT_ADDRESS)} target="_blank" rel="noopener noreferrer">
              USDT Token
            </a>
            <a href="https://www.plasma.to/" target="_blank" rel="noopener noreferrer">
              Plasma Web
            </a>
          </p>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <div className="whatsapp-float">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-link"
          aria-label="Chat via WhatsApp"
        >
          <svg className="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
          </svg>
          <span className="whatsapp-tooltip">Chat dengan Owner</span>
        </a>
      </div>

      {/* Modals */}

      {/* Network Modal */}
      {showNetworkModal && (
        <div className="modal-overlay" onClick={() => setShowNetworkModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Network Switch Required</h3>
              <button onClick={() => setShowNetworkModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="network-warning-box">
                <div className="warning-icon">🌐</div>
                <div className="warning-content">
                  <p><strong>You are on the wrong network</strong></p>
                  <p>To use this dApp, you need to switch to:</p>
                  <div className="network-details">
                    <p><strong>Network:</strong> {PLASMA_NETWORK_NAME}</p>
                    <p><strong>Chain ID:</strong> {PLASMA_CHAIN_ID}</p>
                    <p><strong>RPC URL:</strong> <small>{PLASMA_RPC_URL}</small></p>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowNetworkModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-switch"
                  onClick={switchToPlasmaNetwork}
                  disabled={isLoading}
                >
                  {isLoading ? 'Switching...' : 'Switch Network'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Connect Wallet</h3>
              <button onClick={() => setShowWalletModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {!window.ethereum ? (
                <div className="wallet-install">
                  <div className="wallet-icon">🦊</div>
                  <p><strong>Wallet not detected</strong></p>
                  <p>Please install MetaMask or another Ethereum wallet to continue.</p>
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-connect btn-large"
                  >
                    Install MetaMask
                  </a>
                </div>
              ) : isWrongNetwork ? (
                <div className="wallet-wrong-network">
                  <div className="warning-icon">⚠️</div>
                  <p><strong>Wrong Network</strong></p>
                  <p>Please switch to {PLASMA_NETWORK_NAME} first.</p>
                  <button
                    className="btn btn-switch btn-large"
                    onClick={() => {
                      setShowWalletModal(false);
                      setShowNetworkModal(true);
                    }}
                  >
                    Switch Network
                  </button>
                </div>
              ) : (
                <div className="wallet-connect">
                  <div className="wallet-icon">🔗</div>
                  <p><strong>Connect your wallet</strong></p>
                  <p>Connect your wallet to purchase ebooks or manage your publications.</p>
                  <button
                    className="btn btn-connect btn-large"
                    onClick={connectWallet}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Connecting...' : 'Connect MetaMask'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Publish Ebook Modal */}
      {showPublishModal && (
        <div className="modal-overlay" onClick={() => setShowPublishModal(false)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📖 Publish New Ebook</h3>
              <button onClick={() => setShowPublishModal(false)}>×</button>
            </div>
            <form onSubmit={handlePublishEbook} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Ebook ID *</label>
                  <select
                    value={ebookForm.id}
                    onChange={(e) => setEbookForm({ ...ebookForm, id: e.target.value })}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select ID (1-10)</option>
                    {getAvailableEbookIds().map(id => (
                      <option key={id} value={id}>Ebook #{id}</option>
                    ))}
                  </select>
                  <small>Only IDs 1-10 are allowed</small>
                </div>

                <div className="form-group">
                  <label>Ebook Name *</label>
                  <input
                    type="text"
                    value={ebookForm.name}
                    onChange={(e) => setEbookForm({ ...ebookForm, name: e.target.value })}
                    placeholder="Enter ebook name"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={ebookForm.description}
                    onChange={(e) => setEbookForm({ ...ebookForm, description: e.target.value })}
                    placeholder="Enter ebook description"
                    rows="3"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label>Price (USDT) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={ebookForm.price}
                    onChange={(e) => setEbookForm({ ...ebookForm, price: e.target.value })}
                    placeholder="0.00"
                    required
                    disabled={isLoading}
                  />
                  <small>Price in USDT (6 decimals)</small>
                </div>

                <div className="form-group">
                  <label>Discount</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="discount"
                        value="0"
                        checked={ebookForm.discount === 0}
                        onChange={(e) => setEbookForm({ ...ebookForm, discount: Number(e.target.value) })}
                        disabled={isLoading}
                      />
                      <span>No Discount (0%)</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="discount"
                        value="10"
                        checked={ebookForm.discount === 10}
                        onChange={(e) => setEbookForm({ ...ebookForm, discount: Number(e.target.value) })}
                        disabled={isLoading}
                      />
                      <span>10% Discount</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPublishModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || isWrongNetwork}
                >
                  {isLoading ? 'Publishing...' : 'Publish Ebook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💰 Emergency Withdraw</h3>
              <button onClick={() => setShowWithdrawModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="warning-box">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <p><strong>Warning: This action will withdraw ALL USDT from the contract</strong></p>
                  <p className="withdraw-amount">Current Balance: <strong>{contractBalance} USDT</strong></p>
                  <p>This action cannot be undone. Only proceed if you are sure.</p>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowWithdrawModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleEmergencyWithdraw}
                  disabled={isLoading || isWrongNetwork}
                >
                  {isLoading ? 'Withdrawing...' : 'Withdraw All Funds'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Ebook Modal */}
      {showReviewModal && selectedEbook && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal modal-review" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📖 Review Ebook:</h3>
              <button onClick={closeReviewModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="review-content">
                <div className="review-header">
                  <div className="review-cover">
                    <img src={coverBook} alt={selectedEbook.name} />
                  </div>
                  <div className="review-meta">
                    <h4 className="review-title">{selectedEbook.name}</h4>
                    <div className="review-price">
                      {selectedEbook.discount > 0 ? (
                        <>
                          <span className="original-price-large">{selectedEbook.price} USDT</span>
                          <span className="final-price-large">
                            {(Number(selectedEbook.price) * (100 - selectedEbook.discount) / 100).toFixed(2)} USDT
                          </span>
                          {selectedEbook.discount > 0 && (
                            <span className="discount-tag-large">-{selectedEbook.discount}% OFF</span>
                          )}
                        </>
                      ) : (
                        <span className="final-price-large">{selectedEbook.price} USDT</span>
                      )}
                    </div>
                    <div className="review-status">
                      <span className={`status-badge ${selectedEbook.isSold ? 'sold' : 'available'}`}>
                        {selectedEbook.isSold ? 'Sold Out' : 'Available'}
                      </span>
                      <span className="review-id">ID: {selectedEbook.id}</span>
                    </div>
                  </div>
                </div>
                
                <div className="review-description">
                  <h5>Description:</h5>
                  <div className="description-content">
                    {selectedEbook.description || 'No description available for this ebook.'}
                  </div>
                </div>

                <div className="review-actions">
                  {!selectedEbook.isSold && (
                    <button
                      className="btn btn-buy-review"
                      onClick={() => {
                        closeReviewModal();
                        // Scroll ke form pembelian ebook ini
                        const ebookElement = document.querySelector(`.ebook-card[data-id="${selectedEbook.id}"]`);
                        if (ebookElement) {
                          ebookElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                    >
                      {!account ? 'Connect Wallet to Purchase' : 'Go to Purchase Form'}
                    </button>
                  )}
                  <button
                    className="btn btn-secondary"
                    onClick={closeReviewModal}
                  >
                    Close Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
}

export default App;
