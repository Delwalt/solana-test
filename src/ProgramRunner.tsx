import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import programKeyJson from '../program/dist/hello_rust-keypair.json';
import { Keypair, Transaction, TransactionInstruction, type PublicKey } from '@solana/web3.js';
import { useContext, useState } from 'react';
import { AppContext } from './App';

export const ProgramRunner = () => {
  const app = useContext(AppContext);

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [latestTx, setLatestTx] = useState<string | null>(null);

  const triggerProgram = async () => {
    console.log('running');
    // Get program's public key
    const secretKey = Uint8Array.from(programKeyJson);
    const keypair = Keypair.fromSecretKey(secretKey);
    const programPub: PublicKey = keypair.publicKey;

    if (programPub === null || publicKey === null) return;

    // Performing a transaction on the program
    const instruction = new TransactionInstruction({
      keys: [{ pubkey: publicKey, isSigner: false, isWritable: true }],
      programId: programPub,
      data: Buffer.alloc(0),
    });

    console.log({
      programPub,
      publicKey,
    });
    const transaction = new Transaction().add(instruction);
    console.log('transaction');
    const signature = await sendTransaction(transaction, connection);
    console.log('AsdfasdfsdafasD', {
      signature,
    });

    const latestBlockHash = await connection.getLatestBlockhash();

    const confirmedTx = await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature,
    });

    console.error('transaction confirmed', confirmedTx);
    setLatestTx(signature);

    alert('success');
  };

  return (
    <div className='flex flex-col'>
      <button
        onClick={triggerProgram}
        className='relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800'
      >
        <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0'>
          Trigger Hello Program
        </span>
      </button>

      {latestTx !== null ? (
        <a
          target='_blank'
          title={latestTx}
          href={`https://explorer.solana.com/tx/${latestTx}?cluster=${app.cluster}`}
          className='inline-flex items-center font-medium text-sm text-blue-600 dark:text-blue-500 hover:underline'
          rel='noreferrer'
        >
          Check Latest Tx
          <svg
            className='w-4 h-4 ms-2 rtl:rotate-180'
            aria-hidden='true'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 14 10'
          >
            <path
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M1 5h12m0 0L9 1m4 4L9 9'
            />
          </svg>
        </a>
      ) : (
        ''
      )}
    </div>
  );
};
