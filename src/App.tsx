import { useState, createContext } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

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
