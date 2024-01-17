import React from 'react';
import Head from 'next/head';
import '../styles/index.scss'
import Container from '../components/container';

function App() {
  return (
    <div className='body-faucet'>
      <Head>
        <title>RSK Testnet Faucet</title>
      </Head>
      <Container />
    </div>
  );
}

export default App;
