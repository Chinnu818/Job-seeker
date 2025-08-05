const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const crypto = require('crypto');

class BlockchainService {
  constructor() {
    // Initialize Polygon Web3 (conditional)
    try {
      const Web3 = require('web3');
      this.polygonWeb3 = new Web3(process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com');
    } catch (error) {
      console.warn('Web3 not available, Polygon features will be disabled');
      this.polygonWeb3 = null;
    }
    
    // Initialize Solana connection (using devnet for demo)
    this.solanaConnection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    
    // Contract ABIs and addresses
    this.contracts = {
      polygon: {
        jobContract: process.env.POLYGON_JOB_CONTRACT_ADDRESS,
        paymentContract: process.env.POLYGON_PAYMENT_CONTRACT_ADDRESS
      },
      solana: {
        jobProgram: process.env.SOLANA_JOB_PROGRAM_ID
      }
    };

    // Payment history for demo purposes
    this.paymentHistory = [];
  }

  // Dummy Payment Functions for Demo
  async processDummyPayment(paymentData) {
    try {
      const {
        jobId,
        amount,
        currency,
        fromAddress,
        toAddress,
        network
      } = paymentData;

      // Generate mock transaction hash
      const mockTransactionHash = `demo_tx_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
      
      // Create payment record
      const paymentRecord = {
        id: crypto.randomBytes(16).toString('hex'),
        jobId,
        amount,
        currency,
        transactionHash: mockTransactionHash,
        fromAddress,
        toAddress,
        network,
        status: 'completed',
        timestamp: new Date(),
        isDemo: true
      };

      // Store payment record
      this.paymentHistory.push(paymentRecord);

      console.log('Dummy payment processed:', paymentRecord);

      return {
        success: true,
        transactionHash: mockTransactionHash,
        paymentId: paymentRecord.id,
        status: 'completed',
        isDemo: true
      };
    } catch (error) {
      console.error('Error processing dummy payment:', error);
      throw new Error('Failed to process dummy payment');
    }
  }

  async getPaymentHistory(address, network = 'solana') {
    try {
      // Return demo payment history
      return this.paymentHistory.filter(payment => 
        payment.fromAddress === address && payment.network === network
      );
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  // Polygon Functions
  async createPolygonWallet() {
    try {
      if (!this.polygonWeb3) {
        throw new Error('Polygon Web3 not available');
      }
      const account = this.polygonWeb3.eth.accounts.create();
      return {
        address: account.address,
        privateKey: account.privateKey,
        publicKey: account.publicKey
      };
    } catch (error) {
      console.error('Error creating Polygon wallet:', error);
      throw new Error('Failed to create Polygon wallet');
    }
  }

  async getPolygonBalance(address) {
    try {
      if (!this.polygonWeb3) {
        throw new Error('Polygon Web3 not available');
      }
      const balance = await this.polygonWeb3.eth.getBalance(address);
      return this.polygonWeb3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('Error getting Polygon balance:', error);
      throw new Error('Failed to get Polygon balance');
    }
  }

  async sendPolygonPayment(fromAddress, toAddress, amount, privateKey) {
    try {
      if (!this.polygonWeb3) {
        throw new Error('Polygon Web3 not available');
      }
      const nonce = await this.polygonWeb3.eth.getTransactionCount(fromAddress, 'latest');
      const gasPrice = await this.polygonWeb3.eth.getGasPrice();
      
      const transaction = {
        from: fromAddress,
        to: toAddress,
        value: this.polygonWeb3.utils.toWei(amount.toString(), 'ether'),
        gas: 21000,
        gasPrice: gasPrice,
        nonce: nonce
      };

      const signedTx = await this.polygonWeb3.eth.accounts.signTransaction(transaction, privateKey);
      const receipt = await this.polygonWeb3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error sending Polygon payment:', error);
      throw new Error('Failed to send Polygon payment');
    }
  }

  // Solana Functions
  async createSolanaWallet() {
    try {
      const keypair = crypto.randomBytes(32);
      const publicKey = new PublicKey(keypair);
      
      return {
        publicKey: publicKey.toString(),
        privateKey: keypair.toString('hex')
      };
    } catch (error) {
      console.error('Error creating Solana wallet:', error);
      throw new Error('Failed to create Solana wallet');
    }
  }

  async getSolanaBalance(publicKeyString) {
    try {
      const publicKey = new PublicKey(publicKeyString);
      const balance = await this.solanaConnection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting Solana balance:', error);
      throw new Error('Failed to get Solana balance');
    }
  }

  async sendSolanaPayment(fromPublicKey, toPublicKey, amount, privateKey) {
    try {
      const fromPubKey = new PublicKey(fromPublicKey);
      const toPubKey = new PublicKey(toPublicKey);
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPubKey,
          toPubkey: toPubKey,
          lamports: amount * LAMPORTS_PER_SOL
        })
      );

      const signature = await this.solanaConnection.sendTransaction(transaction, [privateKey]);
      
      return {
        success: true,
        signature: signature,
        amount: amount
      };
    } catch (error) {
      console.error('Error sending Solana payment:', error);
      throw new Error('Failed to send Solana payment');
    }
  }

  // Smart Contract Functions
  async deployJobContract(network, deployerAddress, privateKey) {
    try {
      if (network === 'polygon') {
        return await this.deployPolygonJobContract(deployerAddress, privateKey);
      } else if (network === 'solana') {
        return await this.deploySolanaJobProgram(deployerAddress, privateKey);
      }
      throw new Error('Unsupported network');
    } catch (error) {
      console.error('Error deploying job contract:', error);
      throw new Error('Failed to deploy job contract');
    }
  }

  async deployPolygonJobContract(deployerAddress, privateKey) {
    try {
      // Job contract ABI (simplified)
      const jobContractABI = [
        {
          "inputs": [
            {"name": "jobId", "type": "uint256"},
            {"name": "employer", "type": "address"},
            {"name": "worker", "type": "address"},
            {"name": "amount", "type": "uint256"}
          ],
          "name": "createJob",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {"name": "jobId", "type": "uint256"}
          ],
          "name": "completeJob",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];

      const contract = new this.polygonWeb3.eth.Contract(jobContractABI);
      
      const deployTransaction = contract.deploy({
        data: '0x', // Contract bytecode would go here
        arguments: []
      });

      const gas = await deployTransaction.estimateGas();
      const gasPrice = await this.polygonWeb3.eth.getGasPrice();
      
      const deployOptions = {
        from: deployerAddress,
        gas: gas,
        gasPrice: gasPrice
      };

      const signedTx = await this.polygonWeb3.eth.accounts.signTransaction(
        deployTransaction.encodeABI(),
        privateKey
      );

      const receipt = await this.polygonWeb3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
      return {
        success: true,
        contractAddress: receipt.contractAddress,
        transactionHash: receipt.transactionHash,
        network: 'polygon'
      };
    } catch (error) {
      console.error('Error deploying Polygon job contract:', error);
      throw new Error('Failed to deploy Polygon job contract');
    }
  }

  async deploySolanaJobProgram(deployerPublicKey, privateKey) {
    try {
      // This would involve deploying a Solana program
      // For now, we'll return a mock deployment
      return {
        success: true,
        programId: crypto.randomBytes(32).toString('hex'),
        transactionHash: crypto.randomBytes(32).toString('hex'),
        network: 'solana'
      };
    } catch (error) {
      console.error('Error deploying Solana job program:', error);
      throw new Error('Failed to deploy Solana job program');
    }
  }

  // Payment Processing
  async processJobPayment(jobId, employerAddress, workerAddress, amount, network) {
    try {
      if (network === 'polygon') {
        return await this.processPolygonJobPayment(jobId, employerAddress, workerAddress, amount);
      } else if (network === 'solana') {
        return await this.processSolanaJobPayment(jobId, employerAddress, workerAddress, amount);
      }
      throw new Error('Unsupported network');
    } catch (error) {
      console.error('Error processing job payment:', error);
      throw new Error('Failed to process job payment');
    }
  }

  async processPolygonJobPayment(jobId, employerAddress, workerAddress, amount) {
    try {
      // Create payment transaction
      const paymentData = {
        jobId: jobId,
        employer: employerAddress,
        worker: workerAddress,
        amount: this.polygonWeb3.utils.toWei(amount.toString(), 'ether'),
        timestamp: Date.now()
      };

      // In a real implementation, this would interact with a smart contract
      return {
        success: true,
        transactionHash: crypto.randomBytes(32).toString('hex'),
        network: 'polygon',
        amount: amount,
        jobId: jobId
      };
    } catch (error) {
      console.error('Error processing Polygon job payment:', error);
      throw new Error('Failed to process Polygon job payment');
    }
  }

  async processSolanaJobPayment(jobId, employerPublicKey, workerPublicKey, amount) {
    try {
      // Create payment transaction
      const paymentData = {
        jobId: jobId,
        employer: employerPublicKey,
        worker: workerPublicKey,
        amount: amount * LAMPORTS_PER_SOL,
        timestamp: Date.now()
      };

      // In a real implementation, this would interact with a Solana program
      return {
        success: true,
        signature: crypto.randomBytes(64).toString('hex'),
        network: 'solana',
        amount: amount,
        jobId: jobId
      };
    } catch (error) {
      console.error('Error processing Solana job payment:', error);
      throw new Error('Failed to process Solana job payment');
    }
  }

  // Wallet Verification
  async verifyWalletOwnership(address, signature, message, network) {
    try {
      if (network === 'polygon') {
        return await this.verifyPolygonWallet(address, signature, message);
      } else if (network === 'solana') {
        return await this.verifySolanaWallet(address, signature, message);
      }
      throw new Error('Unsupported network');
    } catch (error) {
      console.error('Error verifying wallet ownership:', error);
      throw new Error('Failed to verify wallet ownership');
    }
  }

  async verifyPolygonWallet(address, signature, message) {
    try {
      const recoveredAddress = this.polygonWeb3.eth.accounts.recover(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error verifying Polygon wallet:', error);
      return false;
    }
  }

  async verifySolanaWallet(publicKey, signature, message) {
    try {
      // Solana signature verification would go here
      // For now, return true as a mock
      return true;
    } catch (error) {
      console.error('Error verifying Solana wallet:', error);
      return false;
    }
  }

  // Transaction History
  async getTransactionHistory(address, network) {
    try {
      if (network === 'polygon') {
        return await this.getPolygonTransactionHistory(address);
      } else if (network === 'solana') {
        return await this.getSolanaTransactionHistory(address);
      }
      throw new Error('Unsupported network');
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw new Error('Failed to get transaction history');
    }
  }

  async getPolygonTransactionHistory(address) {
    try {
      // This would fetch from Polygon scan API
      return [];
    } catch (error) {
      console.error('Error getting Polygon transaction history:', error);
      return [];
    }
  }

  async getSolanaTransactionHistory(publicKey) {
    try {
      const pubKey = new PublicKey(publicKey);
      const signatures = await this.solanaConnection.getSignaturesForAddress(pubKey);
      return signatures.map(sig => ({
        signature: sig.signature,
        slot: sig.slot,
        blockTime: sig.blockTime
      }));
    } catch (error) {
      console.error('Error getting Solana transaction history:', error);
      return [];
    }
  }
}

module.exports = new BlockchainService(); 