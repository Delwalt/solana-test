import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletInteraction } from './useWalletInteraction';
import { Loader } from './Loader';

export const WalletUi = () => {
  const { solBalance, tokens, fetchBalance, isLoading } = useWalletInteraction();
  const { wallet } = useWallet();

  if (wallet == null) {
    return <div className=' block h-40 flex justify-center items-center'> Connect a wallet</div>;
  }

  return (
    <>
      <div className='flex justify-center flex-col text-center mx-auto'>
        {isLoading && (
          <div className='absolute top-2 right-2'>
            <Loader />
          </div>
        )}
        <div className='text-center my-4 '>
          <div className='text-5xl'>{solBalance}</div>
          <small className='text-lg '>SOL</small>
        </div>

        <p className='mb-2 font-bold'>Other SPL tokens</p>
        <table>
          <tbody>
            {tokens.map(token => (
              <tr key={token.symbol}>
                <td style={{ border: '1px solid #ccc' }}>{`${token.name} (${token.symbol})`}</td>
                <td style={{ border: '1px solid #ccc' }}>{token.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          type='button'
          onClick={fetchBalance}
          className='py-2 px-2 mt-2  text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'
        >
          Refresh
        </button>
      </div>
    </>
  );
};
