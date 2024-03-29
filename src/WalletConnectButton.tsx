import { useWallet } from '@solana/wallet-adapter-react';
import { WalletModalButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import { formatAddress } from './helpers';

export const WalletConnectButton = () => {
  const { publicKey, connected } = useWallet();
  return (
    <div className=' w-200 h-200'>
      {connected ? (
        <div className='text-center'>
          <WalletDisconnectButton>Disconnect Wallet</WalletDisconnectButton>
          <div>({formatAddress(publicKey?.toBase58() as string)})</div>
        </div>
      ) : (
        <WalletModalButton>Connect Wallet</WalletModalButton>
      )}
    </div>
  );
};
