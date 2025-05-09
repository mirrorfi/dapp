import { useMemo, useState } from "react";
import { SolanaAgentKit } from "solana-agent-kit";
import TokenPlugin from "@solana-agent-kit/plugin-token";
// import DefiPlugin from "@solana-agent-kit/plugin-defi";
import { Connection, PublicKey } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

export const AgentKitButton = () => {
  //   const [agentKit, setAgentKit] = useState<any>(null);

  const {
    publicKey,
    connected,
    signTransaction,
    signMessage,
    sendTransaction,
    signAllTransactions,
    signAndSendTransaction,
  } = useWallet();

  console.log("publicKey", publicKey);

  //   useEffect(() => {
  //     const fetchStrategies = async () => {
  //       try {
  //         const response = await fetch("/api/get-strategies");
  //         if (!response.ok) {
  //           throw new Error("Failed to fetch strategies");
  //         }
  //         const data = await response.json();
  //         setStrategies(data);
  //       } catch (err) {
  //         setError(
  //           err instanceof Error ? err.message : "Failed to load strategies"
  //         );
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     fetchStrategies();
  //   }, []);

  //   const handleAgentKitTest = async () => {
  //     try {
  //       console.log("AgentKitButton clicked");

  //       const fetchedTxn = fetch("api/agent-kit", {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         }
  //         });
  //         const response = await fetchedTxn;

  //       console.log("AgentKit test completed successfully.");
  //     } catch (error) {
  //       console.error("Error during AgentKit test:", error);
  //     }
  //   };

  return (
    <Button
      variant="ghost"
      onClick={() => {
        // handleAgentKitTest();
      }}
    >
      <Bot />
      Save Strategy
    </Button>
  );
};
