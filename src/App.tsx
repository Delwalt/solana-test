import { useState, createContext, useEffect } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import * as buffer from 'buffer';

import { WalletWrapper } from './WalletWrapper';
import { WalletUi } from './WalletUi';
import { TransactionForm } from './TransactionForm';
import { Header } from './Header';

interface AppCtx {
  sol: number;
  tokens: IToken[];
  cluster: Cluster;
  setCluster: (val: Cluster) => void;
  setTokens: (val: IToken[]) => void;
  setSol: (val: number) => void;
}

export const AppContext = createContext<AppCtx>({
  sol: 0,
  tokens: [],
  cluster: WalletAdapterNetwork.Devnet,
  setCluster: () => {},
  setTokens: () => {},
  setSol: () => {},
});

const App = () => {
  // hack to fix a bug related to buffer not defined
  // see - https://solana.stackexchange.com/questions/212/uncaught-referenceerror-buffer-is-not-defined-using-phantom-wallet-solana-and
  useEffect(() => {
    window.Buffer = buffer.Buffer;
    //  eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    setCluster((localStorage.getItem('cluster') as Cluster) || WalletAdapterNetwork.Devnet);
  }, []);

  const [cluster, setCluster] = useState<Cluster>(WalletAdapterNetwork.Devnet);
  const [tokens, setTokens] = useState<IToken[] | []>([]);
  const [sol, setSol] = useState<number>(0);

  return (
    <AppContext.Provider
      value={{
        sol,
        setSol,
        tokens,
        setTokens,
        cluster,
        setCluster,
      }}
    >
      <WalletWrapper cluster={cluster}>
        <Header />

        <select
          style={{ width: 200 }}
          className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 float-right mr-4'
          value={cluster}
          onChange={event => {
            localStorage.setItem('cluster', event.target.value);
            setCluster(event.target.value as any);
          }}
        >
          <option value={WalletAdapterNetwork.Testnet}>Mainnet Beta</option>
          <option value={WalletAdapterNetwork.Devnet}>Devnet</option>
        </select>

        <div className='bg-white mt-20'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <div className='mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none'>
              <div className='p-8 sm:p-10 lg:flex-auto'>
                <TransactionForm />
              </div>
              <div className='-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0'>
                <div className='rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16 relative'>
                  <div className='mx-auto max-w-xs px-8'>
                    <WalletUi />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </WalletWrapper>
    </AppContext.Provider>
  );
};

export default App;
