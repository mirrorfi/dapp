"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { createSolanaAgent } from "@/lib/agent";
import { SolanaAgentKit } from "solana-agent-kit";

interface AgentContextType {
  agent: SolanaAgentKit | null;
  isAgentLoading: boolean;
}

const AgentContext = createContext<AgentContextType>({
  agent: null,
  isAgentLoading: true,
});

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<SolanaAgentKit | null>(null);
  const [isAgentLoading, setIsAgentLoading] = useState(true);
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    const initializeAgent = async () => {
      if (connected && publicKey) {
        setIsAgentLoading(true);
        try {
          console.log("Initializing Solana Agent...");
          const newAgent = await createSolanaAgent(publicKey.toString());
          setAgent(newAgent);
          console.log("Solana Agent initialized successfully");
        } catch (error) {
          console.error("Failed to initialize Solana Agent:", error);
          setAgent(null);
        } finally {
          setIsAgentLoading(false);
        }
      } else {
        setAgent(null);
        setIsAgentLoading(false);
      }
    };

    initializeAgent();
  }, [publicKey, connected]);

  return (
    <AgentContext.Provider value={{ agent, isAgentLoading }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  return useContext(AgentContext);
}