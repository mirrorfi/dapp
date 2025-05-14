// app/api/token-accounts/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const pubKey = searchParams.get("pubKey");
  const tokenMint = searchParams.get("tokenMint");

  if (!pubKey) {
    return new Response(JSON.stringify({ error: "pubKey is required" }), {
      status: 400,
    });
  }

  if (!process.env.NEXT_PUBLIC_RPC_LINK) {
    return new Response(JSON.stringify({ error: "RPC link is not set" }), {
      status: 500,
    });
  }

  if (!tokenMint) {
    return new Response(JSON.stringify({ error: "tokenMint is required" }), {
      status: 400,
    });
  }

  try {
    // Handle SOL balance differently
    if (tokenMint === "So11111111111111111111111111111111111111112") {
      const response = await fetch(process.env.NEXT_PUBLIC_RPC_LINK, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [pubKey],
        }),
      });
      const json = await response.json();
      if (json.error) {
        console.error("RPC Error:", json.error);
        return new Response(JSON.stringify({ error: json.error.message }), {
          status: 500,
        });
      }
      const lamports = json.result?.value ?? 0;

      return new Response(
        JSON.stringify({
          isNative: true,
          mint: "So11111111111111111111111111111111111111112",
          owner: pubKey,
          state: "initialized",
          tokenAmount: {
            amount: lamports.toString(),
            decimals: 9,
            uiAmount: lamports / 1e9,
            uiAmountString: (lamports / 1e9).toFixed(9),
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Handle SPL tokens
      const response = await fetch(process.env.NEXT_PUBLIC_RPC_LINK, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenAccountsByOwner",
          params: [
            pubKey,
            {
              mint: tokenMint,
            },
            {
              encoding: "jsonParsed",
            },
          ],
        }),
      });
      const json = await response.json();
      if (json.error) {
        console.error("RPC Error:", json.error);
        return new Response(JSON.stringify({ error: json.error.message }), {
          status: 500,
        });
      }
      const data = json.result?.value;
      console.log("Data:", data);

      // If no token account exists, return zero balance
      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({
            isNative: false,
            mint: tokenMint,
            owner: pubKey,
            state: "initialized",
            tokenAmount: {
              amount: "0",
              decimals: 9,
              uiAmount: 0,
              uiAmountString: "0",
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const tokenAccountData = data[0].account.data;
      console.log("Token Account Data:", tokenAccountData);

      const parsedData = tokenAccountData.parsed.info;
      console.log("Parsed Data:", parsedData);

      // Use the same response structure as SOL balance
      return new Response(
        JSON.stringify({
          isNative: false,
          mint: tokenMint,
          owner: pubKey,
          state: parsedData.state,
          tokenAmount: parsedData.tokenAmount,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: unknown) {
    console.error(
      "API Error:",
      error instanceof Error ? error.message : "Unknown error occurred"
    );
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
    });
  }
}
