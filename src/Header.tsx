import { WalletConnectButton } from './WalletConnectButton';

export function Header() {
  return (
    <div className='lg:flex lg:items-center lg:justify-between p-4'>
      <div className='min-w-0 flex-1'>
        <h2 className='text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight'>
          Solana
        </h2>
      </div>
      <div className='mt-5 flex lg:mt-0'>
        <WalletConnectButton />
      </div>
    </div>
  );
}
