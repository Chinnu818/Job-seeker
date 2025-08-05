import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';


interface WalletContextType {
  wallet: any;
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (to: string, amount: number) => Promise<string>;
  getBalance: () => Promise<number>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [balance, setBalance] = useState(0);

  // Initialize Solana connection (using devnet for testing)
  const connection = new Connection(
    import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    'confirmed'
  );

  useEffect(() => {
    // Check if Phantom is installed
    const checkPhantomWallet = async () => {
      if ('solana' in window) {
        const phantom = (window as any).solana;
        if (phantom.isPhantom) {
          setWallet(phantom);
          
          // Check if already connected
          if (phantom.isConnected) {
            setConnected(true);
            setPublicKey(new PublicKey(phantom.publicKey.toString()));
            await getBalance();
          }
        }
      }
    };

    checkPhantomWallet();
  }, []);

  const connect = async () => {
    try {
      setConnecting(true);
      
      if (!wallet) {
        const error = new Error('Phantom wallet not found. Please install Phantom extension from https://phantom.app/');
        console.error('Wallet connection error:', error);
        throw error;
      }

      const response = await wallet.connect();
      setConnected(true);
      setPublicKey(new PublicKey(response.publicKey.toString()));
      await getBalance();
      
      console.log('Connected to Phantom wallet:', response.publicKey.toString());
    } catch (error: any) {
      console.error('Error connecting to wallet:', error);
      setConnected(false);
      setPublicKey(null);
      setBalance(0);
      
      if (error.message.includes('Phantom wallet not found')) {
        alert('Please install Phantom wallet extension from https://phantom.app/ to connect your wallet.');
      } else {
        alert('Failed to connect wallet. Please try again.');
      }
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      if (wallet) {
        await wallet.disconnect();
        setConnected(false);
        setPublicKey(null);
        setBalance(0);
        console.log('Disconnected from wallet');
      }
    } catch (error) {
      console.error('Error disconnecting from wallet:', error);
      throw error;
    }
  };

  const getBalance = async (): Promise<number> => {
    try {
      if (!publicKey) return 0;
      
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
      setBalance(solBalance);
      return solBalance;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  };

  const sendTransaction = async (to: string, amount: number): Promise<string> => {
    try {
      if (!wallet || !publicKey) {
        throw new Error('Wallet not connected');
      }

      // For demo purposes, we'll simulate a successful transaction
      // In a real implementation, this would create and send an actual transaction
      const mockTransactionHash = `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Simulating transaction:', {
        from: publicKey.toString(),
        to: to,
        amount: amount,
        hash: mockTransactionHash
      });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update balance (simulate deduction)
      const newBalance = Math.max(0, balance - amount);
      setBalance(newBalance);

      return mockTransactionHash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  };

  // Listen for wallet connection changes
  useEffect(() => {
    if (wallet) {
      const handleConnect = () => {
        setConnected(true);
        setPublicKey(new PublicKey(wallet.publicKey.toString()));
        getBalance();
      };

      const handleDisconnect = () => {
        setConnected(false);
        setPublicKey(null);
        setBalance(0);
      };

      wallet.on('connect', handleConnect);
      wallet.on('disconnect', handleDisconnect);

      return () => {
        wallet.off('connect', handleConnect);
        wallet.off('disconnect', handleDisconnect);
      };
    }
  }, [wallet]);

  const value: WalletContextType = {
    wallet,
    connected,
    connecting,
    publicKey,
    balance,
    connect,
    disconnect,
    sendTransaction,
    getBalance,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 