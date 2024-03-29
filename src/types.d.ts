type Cluster = 'mainnet-beta' | 'devnet';
interface IToken {
  symbol: string;
  name: string;
  balance: number;
  mintAddress: string;
  decimals: number;
}

interface ITokenListItem {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  tags: string[];
}
