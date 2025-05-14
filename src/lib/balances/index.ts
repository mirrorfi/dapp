import { Connection, PublicKey } from "@solana/web3.js";

const RPC_LINK = process.env.NEXT_PUBLIC_RPC_LINK || "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC_LINK);

// export async function getTokenBalances(pubKey: string, tokenAddresses: string[]) {
//   const params = new URLSearchParams();
//   params.append('pubKey', pubKey);

//   tokenAddresses.forEach((token) => {
//     if(!token) {
//         throw new Error("Token address invalid");
//     }
//     params.append('tokenHashes', token);
//   });

//   console.log(params.toString());
//   const res = await fetch(`/api/balances?${params.toString()}`);
  
//   if (!res.ok) {
//     throw new Error(`Failed to fetch: ${res.status}`);
//   }

//   const data = await res.json();
//   console.log("Token Balances:", data);
//   return data;
// }

export async function getTokenBalance(pubKey:string, tokenMint: string){
    try{
        const params = new URLSearchParams();
        params.append('pubKey', pubKey)
        params.append('tokenMint', tokenMint)
        
        console.log(params.toString());
        const res = await fetch(`/api/balances?${params.toString()}`);

        if(!res.ok){
            throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data = await res.json();
        console.log(data);
        const balance = data.tokenAmount.uiAmountString;

        return balance;
    }catch(e){
        return 0;
    }
}