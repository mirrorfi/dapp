// app/api/token-accounts/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const pubKey = searchParams.get('pubKey');
  const tokenMint = searchParams.get('tokenMint')

  if (!pubKey) {
    return new Response(JSON.stringify({ error: 'pubKey is required' }), {
      status: 400,
    });
  }

  if(!process.env.NEXT_PUBLIC_RPC_LINK) {
    return new Response(JSON.stringify({ error: 'RPC link is not set' }), {
        status: 500,   
    });
  }

  if (!tokenMint) {
    return new Response(JSON.stringify({ error: 'tokenMint is required' }), {
      status: 400,
    });
  }

  try {
    // const response = await fetch(
    //   `https://api.solana.fm/v1/tokens/${pubKey}/token-accounts`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'accept': 'application/json',
    //       'content-type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       includeSolBalance: true,
    //       tokenHashes,
    //     }),
    //   }
    // );
    const response = await fetch(
        process.env.NEXT_PUBLIC_RPC_LINK, 
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getTokenAccountsByOwner",
                params: [
                    pubKey,
                    {
                        mint: tokenMint
                    },
                    {
                        "encoding": "jsonParsed"
                    }
                ]
            })
        }
    );
    const json = await response.json();
    const data = json.result.value;
    console.log("Data:", data);

    const tokenAccountData = data[0].account.data;
    console.log("Token Account Data:", tokenAccountData);

    const parsedData = tokenAccountData.parsed.info;
    console.log("Parsed Data:", parsedData);

    return new Response(JSON.stringify(parsedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
    });
  }
}
