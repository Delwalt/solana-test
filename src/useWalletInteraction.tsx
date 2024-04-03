import { useWallet } from '@solana/wallet-adapter-react';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createTransferInstruction,
} from '@solana/spl-token';

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
} from '@solana/web3.js';

import { useContext, useEffect, useState } from 'react';
import { AppContext } from './App';
import { getClusterUrl, getTokenMetadata } from './helpers';

export const useWalletInteraction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connection, setConnection] = useState<Connection | null>(null);
  const { publicKey, sendTransaction } = useWallet();
  const app = useContext(AppContext);

  useEffect(() => {
    const connection = new Connection(getClusterUrl(app.cluster));
    setConnection(connection);
  }, [app.cluster]);

  // Verifying the Account Exists on the Blockchain
  const checkTokenAccount = async (walletPublicKey: PublicKey, mintAddressString: string) => {
    const mintAddress = new PublicKey(mintAddressString);

    // Calculate the associated token account address
    const associatedTokenAddress = await getAssociatedTokenAddress(mintAddress, walletPublicKey);

    const accountInfo = await connection?.getAccountInfo(associatedTokenAddress);

    return {
      address: associatedTokenAddress,
      isAccountPresent: accountInfo !== null,
    };
  };

  const fetchSolBalance = async () => {
    if (publicKey != null && connection != null) {
      await connection.getBalance(publicKey).then(lamports => {
        const sol = lamports / LAMPORTS_PER_SOL; // Convert lamports to SOL
        app.setSol(sol);
      });
    }
  };

  const getEstimatedTxFee = async (tx: Transaction) => {
    if (connection == null || publicKey == null) return;

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = publicKey;

    const message = tx.compileMessage();
    const feeCalculator = await connection.getFeeForMessage(message, 'recent');
    const estimatedFee = feeCalculator.value;

    return estimatedFee;
  };

  async function transferSPLToken(
    recipientPublicKeyString: string,
    mintAddressString: string,
    amount: number,
  ) {
    setIsLoading(true);
    if (amount === 0) {
      alert('Amount should be greater than 0');
      return;
    }

    if (publicKey == null || connection == null) {
      console.log('Wallet not connected');
      return;
    }

    const token = app.tokens.find(token => token.mintAddress === mintAddressString);

    if (token == null) {
      alert('Something went wrong!');
      console.log('token meta info not found');
      return;
    }

    const amountInSmallestUnit = amount * Math.pow(10, token.decimals);

    const recipientPublicKey = new PublicKey(recipientPublicKeyString);

    // Check if the recipient's/sender associated token account exists before transferring
    const recipientTokenAccount = await checkTokenAccount(recipientPublicKey, mintAddressString);
    const senderTokenAccount = await checkTokenAccount(publicKey, mintAddressString);

    if (!recipientTokenAccount.isAccountPresent) {
      alert("Recipient's does not have associated token account, can't transfer");
      return;
    }

    if (!senderTokenAccount.isAccountPresent) {
      alert("sender's does not have associated token account, can't transfer");
      return;
    }

    const transferInstruction = createTransferInstruction(
      senderTokenAccount.address,
      recipientTokenAccount.address,
      publicKey,
      amountInSmallestUnit,
      [],
      TOKEN_PROGRAM_ID,
    );

    const transaction = new Transaction().add(transferInstruction);

    try {
      // The wallet adapter's sendTransaction method signs and sends the transaction
      const signature = await sendTransaction(transaction, connection);
      const latestBlockHash = await connection.getLatestBlockhash();

      const estimatedFee = await getEstimatedTxFee(transaction);
      if (estimatedFee != null) {
        console.log(`Estimated Transaction Fee: ${estimatedFee} lamports`);
      }

      const confirmedTx = await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature,
      });

      console.error('transaction confirmed', confirmedTx);
      alert('Success!');
    } catch (error) {
      alert(error);
      console.error('Error sending token:', error);
    }

    setIsLoading(false);
  }

  const sendSol = async (recipientPublicKeyString: string, amountSol: number) => {
    setIsLoading(true);
    if (amountSol === 0) {
      alert('Amount should be greater than 0');
      return;
    }

    if (publicKey == null || connection == null) {
      console.log('Wallet not connected');
      return;
    }

    try {
      const recipientPublicKey = new PublicKey(recipientPublicKeyString);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPublicKey,
          lamports: amountSol * LAMPORTS_PER_SOL, // Convert SOL to Lamports
        }),
      );
      const signature = await sendTransaction(transaction, connection);
      const latestBlockHash = await connection.getLatestBlockhash();

      const estimatedFee = await getEstimatedTxFee(transaction);
      if (estimatedFee != null) {
        console.log(`Estimated Transaction Fee: ${estimatedFee} lamports`);
      }

      const confirmedTx = await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature,
      });

      console.error('transaction confirmed', confirmedTx);
      alert('Success!');
    } catch (error) {
      alert(error);
      console.error('Error sending SOL:', error);
    }

    setIsLoading(false);
  };

  const fetchAllTokenBalances = async () => {
    try {
      if (publicKey == null) return;

      // Ensure the publicKey is a PublicKey object
      const ownerPublicKey = new PublicKey(publicKey);

      // Fetch all SPL token accounts for the given wallet
      const tokenAccounts = await connection?.getParsedTokenAccountsByOwner(ownerPublicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), // This is the SPL Token program ID
      });

      if (tokenAccounts == null) return;

      // Iterate through each token account to extract and log the balance and mint address
      // Map each account to a promise that resolves to token data
      const tokenPromises = tokenAccounts?.value.map(async account => {
        const accountInfo = account.account.data.parsed.info;
        const balance = accountInfo.tokenAmount.uiAmount;
        const mintAddress = accountInfo.mint;

        const tokenMeta = await getTokenMetadata(mintAddress);
        return {
          balance,
          mintAddress,
          ...tokenMeta,
        };
      });

      const data = await Promise.all(tokenPromises);
      app.setTokens(data);
    } catch (error) {
      console.error('Error fetching token balances:', error);
      // Handle the error, e.g., update the UI to show an error message
    }
  };

  const fetchBalance = async () => {
    setIsLoading(true);
    try {
      await fetchSolBalance();
      await fetchAllTokenBalances();
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const getBalanceFromPrivateKey = async (privateKey: Uint8Array) => {
    console.log({ privateKey });
    if (connection == null) return;
    try {
      const keypair = Keypair.fromSecretKey(privateKey);
      const balance = await connection.getBalance(keypair.publicKey);
      return { balance, pubKey: keypair.publicKey.toString(), privateKey: keypair.secretKey };
    } catch (error) {
      console.error(error);
    }
  };

  const getBalanceFromPublicKey = async (publicKeyString: string) => {
    if (connection == null) return;
    try {
      const publicKey = new PublicKey(publicKeyString);
      const balance = await connection.getBalance(publicKey);
      return { balance, pubKey: publicKey.toString() };
    } catch (error) {
      console.error(error);
    }
  };

  const tranferFunds = async (
    senderPrivateKeys: Uint8Array[],
    receiverPublicKey: string,
    amount: number,
  ) => {
    try {
      if (connection == null || publicKey == null) return;

      const receiverPubKey = new PublicKey(receiverPublicKey);
      const latestBlockHash = await connection.getLatestBlockhash();
      const transaction = new Transaction();
      const senderAccounts: Keypair[] = [];

      // adding tx instruction for each sender account
      senderPrivateKeys.forEach(privateKey => {
        const senderAccount = Keypair.fromSecretKey(privateKey);
        senderAccounts.push(senderAccount);
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: senderAccount.publicKey,
            toPubkey: receiverPubKey,
            lamports: amount,
          }),
        );
      });

      transaction.recentBlockhash = latestBlockHash.blockhash;
      transaction.feePayer = publicKey;

      console.log('signing tx for following sender accounts', senderAccounts);

      transaction.partialSign(...senderAccounts);
      console.log('sending tx instruction to wallet to sign', transaction);
      const signature = await sendTransaction(transaction, connection);
      console.log('signature received from wallet', signature);

      const confirmedTx = await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature,
      });
      console.log('transaction complete successfully!', confirmedTx);
      alert('Success!');

      return signature;
    } catch (error) {
      console.log('err', error);
      alert(error);
    }
  };

  useEffect(() => {
    if (connection != null) {
      fetchBalance();
    }
  }, [connection, publicKey]);

  return {
    fetchBalance,
    solBalance: app.sol,
    connection,
    tokens: app.tokens,
    sendSol,
    transferSPLToken,
    isLoading,
    getBalanceFromPrivateKey,
    tranferFunds,
    getBalanceFromPublicKey,
  };
};
