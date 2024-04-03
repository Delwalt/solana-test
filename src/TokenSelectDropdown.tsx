import { useWalletInteraction } from './useWalletInteraction';

export const TokenSelectDropdown = () => {
  const { tokens, solBalance, isLoading } = useWalletInteraction();

  return (
    <>
      <select
        id='token'
        name='token'
        defaultValue='sol'
        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
      >
        <option value='sol'>Sol ({solBalance})</option>
        {isLoading && <option disabled>Loading more...</option>}
        {!isLoading
          ? tokens.map(token => (
              <option key={token.symbol} value={token.mintAddress}>
                {token.symbol} ({token.balance})
              </option>
            ))
          : null}
      </select>
    </>
  );
};
