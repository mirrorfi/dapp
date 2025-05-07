import { Plugin, SolanaAgentKit } from "solana-agent-kit";



import {
    sanctumAddLiquidityAction,
    sanctumGetLSTAPYAction,
    sanctumGetLSTPriceAction,
    sanctumGetLSTTVLAction,
    sanctumGetOwnedLSTAction,
    sanctumRemoveLiquidityAction,
    sanctumSwapLSTAction,
  } from "./actions";
  // Import Sanctum tools and actions
  import {
    sanctumAddLiquidity,
    sanctumGetLSTAPY,
    sanctumGetLSTPrice,
    sanctumGetLSTTVL,
    sanctumGetOwnedLST,
    sanctumRemoveLiquidity,
    sanctumSwapLST,
  } from "./tools";


  // Define and export the plugin
const SanctumPlugin = {
    name: "sanctum",
  
    // Combine all tools
    methods: {
        // Sanctum methods
        sanctumSwapLST,
        sanctumAddLiquidity,
        sanctumGetLSTAPY,
        sanctumGetLSTPrice,
        sanctumGetLSTTVL,
        sanctumGetOwnedLST,
        sanctumRemoveLiquidity,
    },
    
    // Combine all actions
    actions: [    
        // Sanctum actions
        sanctumAddLiquidityAction,
        sanctumGetLSTAPYAction,
        sanctumGetLSTPriceAction,
        sanctumGetLSTTVLAction,
        sanctumGetOwnedLSTAction,
        sanctumRemoveLiquidityAction,
        sanctumSwapLSTAction,
    ],
    // Initialize function
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
export default SanctumPlugin;