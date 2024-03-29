import { useWalletInteraction } from './useWalletInteraction';
import { Loader } from './Loader';
import { TokenSelectDropdown } from './TokenSelectDropdown';

export const TransactionForm = () => {
  const { sendSol, isLoading, transferSPLToken } = useWalletInteraction();
  const handleTransaction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const elements = new FormData(event.currentTarget);
    const rawAmount = elements.get('amount') as string;
    const tokenMintAddress = elements.get('token') as string;
    const amount = rawAmount !== null ? Number(rawAmount) : 0;
    console.log({ rawAmount, amount, tokenMintAddress });
    const address = elements.get('address') as string;

    if (tokenMintAddress === null) {
      alert('Select a token');
    } else if (tokenMintAddress === 'sol') {
      await sendSol(address, amount);
    } else {
      await transferSPLToken(address, tokenMintAddress, amount);
    }
  };

  console.log('Asdf', { isLoading });

  return (
    <>
      {isLoading && <Loader />}
      <h3 className='text-2xl font-bold tracking-tight text-gray-900'>Transfer Money</h3>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form className='space-y-6 mt-10' onSubmit={handleTransaction}>
        <TokenSelectDropdown />
        <div>
          <div className='mt-2'>
            <input
              id='Amount'
              name='amount'
              type='text'
              placeholder='Amount to send'
              autoComplete='Amount'
              required
              className='block h-12  p-1.5 w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 '
            />
          </div>
        </div>

        <div>
          <div className='mt-2'>
            <input
              id='address'
              name='address'
              type='address'
              placeholder='Address of the recipient'
              autoComplete='address'
              required
              className='block h-12  p-1.5 w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 '
            />
          </div>
        </div>

        <div>
          <button
            type='submit'
            className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
          >
            Transfer
          </button>
        </div>
      </form>
    </>
  );
};
