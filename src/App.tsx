// @ts-nocheck
import { useEffect, useState } from 'react';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';

import { getSPLTokenBalance, USDC_MINT_ADDRESS_TEST, getAllTokenBalances } from './helpers';

function App() {
  // State to store the balance
  const [tokens, setTokens] = useState([]);
  const [balance, setBalance] = useState<number | '--'>('--');
  const [usdc, setUsdc] = useState<number | '--'>('--');
  const [chainEnv, setChainEnv] = useState<'mainnet-beta' | 'devnet'>('devnet');
  const [publicKey, setPublicKey] = useState('GgTY3WobvjHzmiWBg454o9jorEhykwd5AxpAX37fba2Q');
  let connection;

  const AIRDROP_AMOUNT = 2 * 1000000000;

  useEffect(() => {
    connection = new Connection(clusterApiUrl(chainEnv), 'confirmed');
  }, [chainEnv, publicKey]);

  const getSolBalance = async () => {
    try {
      // Fetch the balance
      const balance = await connection?.getBalance(new PublicKey(publicKey));

      // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
      return balance / 1000000000;
    } catch (error) {
      alert(error);
      console.error(error);
    }
  };

  const getBalance = async () => {
    console.log('hello');
    const usdc = await getSPLTokenBalance(connection, publicKey, USDC_MINT_ADDRESS_TEST);
    const sol = await getSolBalance();
    const allTokens = await getAllTokenBalances(connection, publicKey);
    setTokens(allTokens);
    console.log({ allTokens });
    if (sol !== undefined || sol !== null) setBalance(sol);
    setUsdc(usdc);
  };

  const airdropSol = async () => {
    try {
      console.log(`Requesting airdrop for ${publicKey}`);
      // 1 - Request Airdrop
      const signature = await connection?.requestAirdrop(new PublicKey(publicKey), AIRDROP_AMOUNT);
      // 2 - Fetch the latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection?.getLatestBlockhash();
      // 3 - Confirm transaction success
      await connection?.confirmTransaction(
        {
          blockhash,
          lastValidBlockHeight,
          signature,
        },
        'finalized',
      );
      // 4 - Log results
      console.log(`Tx Complete: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    } catch (error) {
      alert(error);
    }
  };

  console.log({ tokens });

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ padding: 20, width: 500 }}>
        <p>
          <b>Address</b>
        </p>
        <select
          style={{ width: '100%', height: 30, fontSize: 15, marginBottom: 5 }}
          value={chainEnv}
          onChange={event => {
            setChainEnv(event.target.value as any);
          }}
        >
          <option value='mainnet-beta'>Mainnet Beta</option>
          <option value='devnet'>Devnet</option>
        </select>
        <input
          value={publicKey}
          style={{ width: '100%', height: 30, fontSize: 15 }}
          onChange={e => setPublicKey(e.target.value)}
        />
        <br />
        <br />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <button onClick={getBalance}>Check Balance</button> <br />
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <button onClick={airdropSol}>Airdrop 1 SOL</button>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          width: 600,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h1>Solana Wallet Balance</h1>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <p style={{ textAlign: 'center', fontSize: 45, margin: '4px 0' }}>
            <h3 style={{ margin: '4px 0' }}>{balance}</h3>
            <small>SOL</small>
          </p>
        </div>

        <p>
          <b>Other SPL tokens</b>
        </p>
        <table>
          {tokens?.map(token => (
            <tr key={token.symbol}>
              <td style={{ border: '1px solid #ccc' }}>{`${token.name} (${token.symbol})`}</td>{' '}
              <td style={{ border: '1px solid #ccc' }}>{token.balance}</td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
}

export default App;
