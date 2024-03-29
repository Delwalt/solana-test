import { useWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

import { useContext, useEffect, useState } from 'react';
import { AppContext } from './App';
import { getTokenMetadata } from './helpers';

export const useWalletInteraction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<IToken[] | []>([]);
  const [connection, setConnection] = useState<Connection | null>(null);
  const { publicKey, sendTransaction } = useWallet();
  const app = useContext(AppContext);

  useEffect(() => {
    console.log(app.cluster);
    const connection = new Connection(clusterApiUrl(app.cluster));
    setConnection(connection);
  }, [app.cluster]);

  const fetchSolBalance = async () => {
    if (publicKey != null && connection != null) {
      await connection.getBalance(publicKey).then(lamports => {
        const sol = lamports / LAMPORTS_PER_SOL; // Convert lamports to SOL
        setSolBalance(sol);
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

      const actualFee = confirmedTx?.meta?.fee;
      console.error('transaction confirmed', confirmedTx);
      console.log(`Actual Transaction Fee: ${actualFee} lamports`);
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
      setTokens(data);
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
  useEffect(() => {
    if (connection != null) {
      fetchBalance();
    }
  }, [connection, publicKey]);

  console.log({ isLoading });

  return {
    fetchBalance,
    solBalance,
    connection,
    tokens,
    sendSol,
    isLoading,
  };
};
