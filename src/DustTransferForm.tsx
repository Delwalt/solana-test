import { useEffect, useState } from 'react';
import { convertBase58KeyToUnit8Array, formatAddress } from './helpers';
import { useWalletInteraction } from './useWalletInteraction';

import { Loader } from './Loader';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const DustTransferForm = () => {
  const [isFullAmount, setIsFullAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [senderInput, setSenderInput] = useState('');
  const [receiverInput, setReceiverInput] = useState('');
  const { getBalanceFromPrivateKey, tranferFunds, getBalanceFromPublicKey } =
    useWalletInteraction();
  const [senderAccounts, setSenderAccounts] = useState<
    Array<{ balance: number; pubKey: string; privateKey: Uint8Array } | undefined> | []
  >([]);
  const [receiverAccounts, setReceiverAccounts] = useState<
    | {
        balance: number;
        pubKey: string;
      }
    | undefined
  >(undefined);

  const getSenderBalance = async (value: string) => {
    const privateKeysArray = value.split('\n').filter(key => Boolean(key));
    const privateKeysUnit8 = privateKeysArray.map(convertBase58KeyToUnit8Array);
    const balancePromises = privateKeysUnit8.map(getBalanceFromPrivateKey);
    const accounts = await Promise.all(balancePromises).catch(errors => console.log(errors));
    setSenderAccounts(accounts);
  };

  const getReceiverBalance = async (value: string) => {
    const data = await getBalanceFromPublicKey(value);
    setReceiverAccounts(data);
  };

  const fetchBalance = async () => {
    setIsProcessing(true);
    if (senderInput) {
      await getSenderBalance(senderInput);
    }
    if (receiverInput) {
      await getReceiverBalance(receiverInput);
    }
    setIsProcessing(false);
  };

  useEffect(() => {
    if (senderInput.trim() !== '' || receiverInput.trim() !== '') {
      fetchBalance();
    }
  }, [senderInput, receiverInput]);

  const handleTransaction = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsProcessing(true);
    event.preventDefault();
    const elements = new FormData(event.currentTarget);
    const receiverPubKey = elements.get('address') as string;

    const totalAmount = senderAccounts.reduce(
      (accumulator: number, currentValue) => accumulator + (currentValue?.balance | 0),
      0,
    );

    const amountToTransfer = isFullAmount ? totalAmount : customAmount;

    const validSenderAccounts = senderAccounts.filter(account => Boolean(account));
    const senderAccountPrivateKeys = validSenderAccounts.map(account => account?.privateKey);

    if (senderAccounts[0] != null) {
      await tranferFunds(
        senderAccountPrivateKeys as Uint8Array[],
        receiverPubKey,
        amountToTransfer,
      );
    }

    setIsProcessing(false);
  };

  const totalDust = senderAccounts.reduce(
    (accumulator: number, currentValue) => accumulator + (currentValue?.balance | 0),
    0,
  );

  const amountToTransfer = isFullAmount ? totalDust : customAmount;

  return (
    <div className='relative'>
      {isProcessing && (
        <div className='absolute top-2 right-2'>
          <Loader />
        </div>
      )}
      <div className='flex flex-row space-x-8'>
        <div className='flex-1'>
          <h3 className='text-2xl font-bold tracking-tight text-gray-900'>Transfer Dust</h3>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <form className='space-y-6 mt-10' onSubmit={handleTransaction}>
            <div>
              <div className='mt-2'>
                <textarea
                  onChange={e => setSenderInput(e.target.value)}
                  value={senderInput}
                  required
                  name='privateKeys'
                  rows='10'
                  className='block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 '
                  placeholder='Enter private keys comma separated'
                ></textarea>
              </div>
            </div>

            <div>
              <div className='mt-2'>
                <input
                  onChange={e => setReceiverInput(e.target.value)}
                  value={receiverInput}
                  id='address'
                  name='address'
                  type='address'
                  placeholder='Address of the receiver'
                  autoComplete='address'
                  required
                  className='block h-12  p-1.5 w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 '
                />
              </div>
            </div>

            <div className='flex justify-between'>
              <div className='flex space-x-2 '>
                <label className='inline-flex items-center cursor-pointer'>
                  <input
                    onChange={e => setIsFullAmount(e.target.checked)}
                    type='checkbox'
                    value=''
                    className='sr-only peer'
                    checked={isFullAmount}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className='ms-3 text-sm font-medium text-gray-900'>Transfer All</span>
                </label>

                {!isFullAmount ? (
                  <input
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    className=' w-20 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 '
                    placeholder='90210'
                    required
                  />
                ) : (
                  ''
                )}
              </div>
              <button
                type='submit'
                className='text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center '
              >
                Transfer Dust ({amountToTransfer} lamps)
              </button>
            </div>
          </form>
        </div>

        <div className=' flex-1'>
          <div>
            <h2 className='font-semibold mb-2'>Receiver Account</h2>
            <div className='relative overflow-x-auto'>
              <table className='w-full text-sm text-left rtl:text-right text-gray-500 border'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-50 '>
                  <tr>
                    <th scope='col' className='px-6 py-3'>
                      Public Address
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      Current Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className='bg-white border-b'>
                    <th
                      scope='row'
                      className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'
                    >
                      {receiverAccounts?.pubKey
                        ? formatAddress(receiverAccounts.pubKey)
                        : 'Invalid Public Key '}
                    </th>
                    <td className='px-6 py-4'>
                      <span className=' font-extrabold'>
                        {receiverAccounts?.balance || 0} Lamps
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className='font-semibold mb-2  mt-2'>Sender Accounts</h2>
            <div className='relative overflow-x-auto'>
              <table className='w-full text-sm text-left rtl:text-right text-gray-500 border'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-50 '>
                  <tr>
                    <th scope='col' className='px-6 py-3'>
                      Public Address
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      Dust Amount (Lamp)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {senderAccounts.map((account, index) => (
                    <tr className='bg-white border-b' key={index}>
                      <th
                        scope='row'
                        className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'
                      >
                        {account?.pubKey ? formatAddress(account.pubKey) : 'Invalid Public Key'}
                      </th>
                      <td className='px-6 py-4'>
                        {account?.balance === undefined ? 'Invalid Public Key' : account.balance}
                      </td>
                    </tr>
                  ))}

                  <tr className='bg-white border-b'>
                    <th
                      scope='row'
                      className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'
                    >
                      Total Dust
                    </th>
                    <td className='px-6 py-4'>
                      <div>
                        <span className=' font-extrabold'>{totalDust} Lamps</span>
                      </div>
                      <div>
                        <span className=' font-extrabold'>{totalDust / LAMPORTS_PER_SOL} SOL</span>
                      </div>
                    </td>
                  </tr>
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
          </div>
        </div>
      </div>
    </div>
  );
};
