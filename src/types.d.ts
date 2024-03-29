type Cluster = 'mainnet-beta' | 'devnet';
interface IToken {
  symbol: string;
  name: string;
  balance: number;
  mintAddress: string;
}
