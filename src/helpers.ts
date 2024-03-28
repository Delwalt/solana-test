// @ts-nocheck
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Token } from '@solana/spl-token';

export const USDC_MINT_ADDRESS_TEST = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

// URL to the Solana token list
const tokenListUrl =
  'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json';

// Function to fetch the token list and find a token by mint address
const getTokenMetadata = async mintAddress => {
  const response = await fetch(tokenListUrl);
  const { tokens } = await response.json();

  // Find the token in the list
  const tokenMetadata = tokens.find(token => token.address === mintAddress);

  if (tokenMetadata) {
    return { name: tokenMetadata.name, symbol: tokenMetadata.symbol };
  } else {
    return { name: 'Unknown', symbol: 'Unknown' };
  }
};

export const getSPLTokenBalance = async (connection, publicKey, mintAddress) => {
  try {
    let tokenAmount;
    // Ensure connection is defined (considering connection is set outside this function)
    if (!connection) return;

    // Create a PublicKey object for the mint address
    const mintPublicKey = new PublicKey(mintAddress);

    // Get the token's account info
    const tokenAccounts = await connection?.getParsedTokenAccountsByOwner(
      new PublicKey(publicKey),
      {
        mint: mintPublicKey,
      },
    );

    if (tokenAccounts.value.length > 0) {
      const accountInfo = tokenAccounts.value[0].account.data.parsed.info;
      const balance = accountInfo.tokenAmount.uiAmount;

      // Update your state or log the balance
      console.log(`Balance: ${balance} USDC`);

      tokenAmount = balance;
      // setBalance(balance); // Assuming you have a setter for updating state
    } else {
      console.log('No token account found.');
      // setBalance(0); // Assuming you have a setter for updating state
    }

    return tokenAmount;
  } catch (error) {
    alert(error);
    console.error(error);
  }
};

export const getAllTokenBalances = async (connection, publicKey) => {
  try {
    const tokens = [];
    // Ensure the publicKey is a PublicKey object
    const ownerPublicKey = new PublicKey(publicKey);

    // Fetch all SPL token accounts for the given wallet
    const tokenAccounts = await connection?.getParsedTokenAccountsByOwner(ownerPublicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), // This is the SPL Token program ID
    });

    console.log({ tokenAccounts });

    // Iterate through each token account to extract and log the balance and mint address
    // Map each account to a promise that resolves to token data
    const tokenPromises = tokenAccounts.value.map(async account => {
      const accountInfo = account.account.data.parsed.info;
      const balance = accountInfo.tokenAmount.uiAmount;
      const mintAddress = accountInfo.mint;

      try {
        const tokenMeta = await getTokenMetadata(mintAddress);
        return {
          balance,
          mintAddress,
          ...tokenMeta,
        };
      } catch (error) {
        console.error(`Failed to fetch metadata for mint address: ${mintAddress}`, error);
        // Return a default structure even if metadata fetch fails
        return {
          balance,
          mintAddress,
        };
      }
    });

    // Wait for all promises to resolve and then perform your action
    return await Promise.all(tokenPromises);
  } catch (error) {
    console.error('Error fetching token balances:', error);
    // Handle the error, e.g., update the UI to show an error message
  }
};
