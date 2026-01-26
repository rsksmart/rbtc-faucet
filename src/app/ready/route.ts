import { NextResponse } from 'next/server';
import { version } from '../../../package.json';

export async function GET() {
  
  const isReady = true; 
  
  if (!isReady) {
    return NextResponse.json(
      {
        status: 'not ready',
        version,
        timestamp: new Date().toISOString(),
        service: 'rbtc-faucet',
      },
      { status: 503 }
    );
  }
  
  return NextResponse.json(
    {
      status: 'ready',
      version,
      timestamp: new Date().toISOString(),
      service: 'rbtc-faucet',
    },
    { status: 200 }
  );
}

