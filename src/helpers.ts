import bs58 from 'bs58';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// URL to the Solana token list
const tokenListUrl =
  'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json';

export const fetchTokens = async () => {
  const response = await fetch(tokenListUrl);
  const data = (await response.json()) as { tokens: ITokenListItem[] };
  return data.tokens;
};

// Function to fetch the token list and find a token by mint address
export const getTokenMetadata = async (mintAddress: string) => {
  const tokens = await fetchTokens();

  // Find the token in the list
  const tokenMetadata = tokens.find(token => token.address === mintAddress);

  if (tokenMetadata != null) {
    return {
      name: tokenMetadata.name,
      symbol: tokenMetadata.symbol,
      decimals: tokenMetadata.decimals,
    };
  } else {
    return { name: 'Unknown', symbol: 'Unknown', decimals: 0 };
  }
};

export function formatAddress(address: string) {
  if (address.length > 8) {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  }
  return address;
}

export function getClusterUrl(cluster: Cluster) {
  if (cluster === WalletAdapterNetwork.Mainnet) {
    return 'https://solana-mainnet.core.chainstack.com/58125655a2da18dadf9f46a097b575bc';
  }

  return clusterApiUrl(cluster);
}

export function convertBase58KeyToUnit8Array(privateKeyBase58: string) {
  const buffer = Buffer.from(bs58.decode(privateKeyBase58));

  return new Uint8Array(buffer);
}
