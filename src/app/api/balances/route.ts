// app/api/token-accounts/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const tokenHashes = searchParams.getAll('tokenHashes');
  const pubKey = searchParams.get('pubKey');

  if (!pubKey) {
    return new Response(JSON.stringify({ error: 'pubKey is required' }), {
      status: 400,
    });
  }

  if (tokenHashes.length === 0) {
    return new Response(JSON.stringify({ error: 'tokenHashes[] is required' }), {
      status: 400,
    });
  }

  try {
    const response = await fetch(
      `https://api.solana.fm/v1/tokens/${pubKey}/token-accounts`,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          includeSolBalance: true,
          tokenHashes,
        }),
      }
    );

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
    });
  }
}
