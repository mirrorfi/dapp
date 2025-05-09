import { Plugin, SolanaAgentKit } from "solana-agent-kit";
// Import Orca tools
import {
    // orcaClosePosition,
    // orcaCreateCLMM,
    // orcaCreateSingleSidedLiquidityPool,
    // orcaFetchPositions,
    orcaOpenCenteredPositionWithLiquidity,
    // orcaOpenSingleSidedPosition,
  } from "./tools";

// Define and export the plugin
const OrcaPlugin = {
    name: "orca plugin",
  
    // Combine all tools
    methods: {
        // orcaClosePosition,
        // orcaCreateCLMM,
        // orcaCreateSingleSidedLiquidityPool,
        // orcaFetchPositions,
        orcaOpenCenteredPositionWithLiquidity,
        // orcaOpenSingleSidedPosition,
    },

    // Add the required actions property
    actions: [],

    initialize: function (agent: SolanaAgentKit): void {
        // Initialize all methods with the agent instance
        Object.entries(this.methods).forEach(([methodName, method]) => {
          if (typeof method === "function") {
            this.methods[methodName] = method.bind(null, agent);
          }
        });
    },
} satisfies Plugin;

// Default export for convenience
export default OrcaPlugin;