import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletInteraction } from './useWalletInteraction';
import { Loader } from './Loader';

export const WalletUi = () => {
  const { solBalance, tokens, fetchBalance, isLoading } = useWalletInteraction();
  const { wallet } = useWallet();

  console.log({ solBalance, wallet });

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
        <p className='text-center my-4 '>
          <h3 className='text-5xl'>{solBalance}</h3>
          <small className='text-lg '>SOL</small>
        </p>

        <p className='mb-2 font-bold'>Other SPL tokens</p>
        <table>
          {tokens.map(token => (
            <tr key={token.symbol}>
              <td style={{ border: '1px solid #ccc' }}>{`${token.name} (${token.symbol})`}</td>{' '}
              <td style={{ border: '1px solid #ccc' }}>{token.balance}</td>
            </tr>
          ))}
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
