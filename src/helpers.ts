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
    return { name: tokenMetadata.name, symbol: tokenMetadata.symbol };
  } else {
    return { name: 'Unknown', symbol: 'Unknown' };
  }
};

export function formatAddress(address: string) {
  if (address.length > 8) {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  }
  return address;
}
