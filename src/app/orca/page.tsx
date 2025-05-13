// "use client";

// import {
//   ORCA_WHIRLPOOL_PROGRAM_ID,
//   PoolUtil,
//   PriceMath,
//   WhirlpoolContext,
//   buildWhirlpoolClient,
// } from "@orca-so/whirlpools-sdk";
// import { useEffect } from "react";
// import { useWallet } from "@solana/wallet-adapter-react";

// const connection =
//   process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";

// export default function OrcaPage() {
//   const wallet = useWallet();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const ctx = WhirlpoolContext.from(
//           connection,
//           {
//             publicKey: wallet.publicKey,
//             signAllTransactions: wallet.signAllTransactions,
//             signTransaction: wallet.signTransaction,
//           },
//           ORCA_WHIRLPOOL_PROGRAM_ID
//         );
//         const client = buildWhirlpoolClient(ctx);
//         const whirlpool = await client.getPool(whirlpoolAddress);
//         console.log(whirlpool);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div>
//       <h1>Orca Page</h1>
//       <p>This is the Orca page.</p>
//     </div>
//   );
// }
