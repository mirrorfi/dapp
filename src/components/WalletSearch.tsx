import { PublicKey, Connection } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Moralis from "moralis";
import Image from "next/image";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const solConversionFactor = 1e9;

const WalletSearch = () => {
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]); // State for historical balance data
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [connection, setConnection] = useState<Connection | null>(null);
  const anchorWallet = useAnchorWallet();

  useEffect(() => {
    // Initialize the connection and Moralis API when the component mounts
    const initConnectionAndMoralis = () => {
      const conn = new Connection(
        "https://solana-mainnet.g.alchemy.com/v2/" +
          process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
      );
      setConnection(conn);

      Moralis.start({
        apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
      });
    };

    if (!connection) {
    initConnectionAndMoralis();
    }
  }, [connection]);

  useEffect(() => {
    if(!anchorWallet) {
      console.log("Wallet Not Connected!");
      return;
    } else {
      console.log("Wallet Connected!");
      console.log("Anchor Wallet:", anchorWallet.publicKey?.toString());
      setAddress(anchorWallet.publicKey?.toString() || "");
    }
  }, []);

  useEffect(() => {
    if (address != "") {
      fetchWalletData(); // Fetch wallet data when address changes
    }
  }, [address]);

  const fetchWalletData = async () => {
    if (!connection) return; // Ensure connection is available before fetching

    setLoading(true);
    setError(null);

    // Fetch portfolio data
    try {
      const response = await Moralis.SolApi.account.getSPL({
        network: "mainnet",
        address,
      });

      const data = response.toJSON();
      setTokens(data);
      console.log("Tokens:", data);
    } catch (err) {
      setError("Invalid address or unable to fetch data.");
      console.error("Error in fetchWalletData:", err);
    } finally {
      setLoading(false);
    }

    // // Fetch transaction and balance history
    // try {
    //   const publicKey = new PublicKey(address.trim());

    //   // Fetch SOL balance
    //   const balance = await connection.getBalance(publicKey);
    //   setBalance(balance / solConversionFactor);

    //   // Fetch recent transaction signatures
    //   const signatures = await connection.getSignaturesForAddress(publicKey, {
    //     limit: 30,
    //   });

    //   const transactionDetailsPromises = signatures.map(
    //     async (signatureInfo) => {
    //       const transaction = await connection.getTransaction(
    //         signatureInfo.signature,
    //         { maxSupportedTransactionVersion: 2 }
    //       );
    //       return transaction;
    //     }
    //   );

    //   const transactions = await Promise.all(transactionDetailsPromises);
    //   setTransactions(transactions);

    //   // Calculate historical balance based on transactions
    //   const historicalBalances = calculateHistoricalBalances(
    //     transactions,
    //     balance / solConversionFactor
    //   );
    //   setHistoricalData(historicalBalances); // Set the historical data for chart
    // } catch (err) {
    //   setError("Invalid address or unable to fetch data.");
    //   console.error("Error in fetchBalance:", err);
    // } finally {
    //   setLoading(false);
    // }
  };

  // Helper function to calculate historical balances
  const calculateHistoricalBalances = (
    transactions: any[],
    currentBalance: number
  ) => {
    const balanceHistory: {
      time: string; // Convert blockTime to human-readable date
      balance: number;
    }[] = [];
    let runningBalance = currentBalance;

    // Sort transactions by block time
    const sortedTransactions = transactions
      .filter((tx) => tx !== null)
      .sort((a, b) => b.blockTime - a.blockTime); // Sort descending (newest to oldest)

    // Calculate balance changes
    sortedTransactions.forEach((transaction) => {
      const { meta, blockTime } = transaction;

      const preBalance = meta.preBalances[0] / solConversionFactor;
      const postBalance = meta.postBalances[0] / solConversionFactor;

      const balanceChange = postBalance - preBalance;

      // Save balance at each block time
      runningBalance -= balanceChange;
      balanceHistory.push({
        time: new Date(blockTime * 1000).toISOString(), // Convert blockTime to human-readable date
        balance: runningBalance,
      });
    });

    return balanceHistory.reverse(); // Return in chronological order
  };

  return (
    <div className="mx-auto w-11/12 md:w-10/12 lg:w-9/12 xl:w-2/3 my-8">
      {loading ? (
        <div className="mt-4">
          <Skeleton className="w-[380px] h-[180px] rounded-lg"></Skeleton>
          <div className="mt-12 flex flex-col w-full">
            <Skeleton className="w-24 h-10 self-end"></Skeleton>
            <Skeleton className="w-full h-10 mt-2"></Skeleton>
            <Skeleton className="w-full h-10 mt-1"></Skeleton>
            <Skeleton className="w-full h-10 mt-1"></Skeleton>
            <Skeleton className="w-full h-10 mt-1"></Skeleton>
          </div>
        </div>
      ) : (
        <div></div>
        // balance !== null &&
        // tokens !== null && (
        //   <div className="mt-4 w-full">
        //     <div className="flex flex-col xl:flex-row xl:space-x-4">
        //       <div className="sm:flex xl:flex-col xl:space-y-4 sm:space-x-4 xl:space-x-0">
        //         <BalanceCard SOLBalance={balance} />
        //         <PieChart tokens={tokens} />
        //       </div>
        //       {historicalData.length > 0 ? (
        //         <Card className="w-full mt-4 xl:mt-0 flex flex-col">
        //           <CardHeader>
        //             <CardTitle>Balance Over Time</CardTitle>
        //             <CardDescription>
        //               Balance of the wallet over time
        //             </CardDescription>
        //           </CardHeader>
        //           <CardContent className="w-full h-full">
        //             <LineChart data={historicalData} />
        //           </CardContent>
        //         </Card>
        //       ) : (
        //         <Card className="w-full">
        //           <CardHeader>
        //             <CardTitle>Balance Over Time</CardTitle>
        //             <CardDescription>
        //               No historical data available
        //             </CardDescription>
        //           </CardHeader>
        //           <CardContent className="flex flex-col items-center w-full h-full">
        //             <Image
        //               src="/no-data-illustration.png"
        //               alt="No historical data available"
        //               width={450}
        //               height={450}
        //             />
        //             <p className="text-muted mt-4 text-sm">
        //               No historical data available for this wallet
        //             </p>
        //           </CardContent>
        //         </Card>
        //       )}
        //     </div>
        //     <div className="mt-4">
        //       <TransactionTable transactions={transactions} address={address} />
        //     </div>
        //     <div className="flex space-x-4 mt-4">
        //       {tokens.length > 0 && <TokensTable tokens={tokens} />}
        //     </div>
        //   </div>
        // )
      )}
    </div>
  );
};

export default WalletSearch;
