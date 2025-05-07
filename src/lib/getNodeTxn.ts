import { VersionedTransaction, TransactionMessage } from "@solana/web3.js";
import { tokenMintAddresses, protocolOptions } from "../constants/nodeOptions";
import { type TreeNode } from "./treeUtils";

export const getNodeTxn = async(node: Node, agent: any) => {

    // if (node.nodeType == "protocol") {
    //     const methodList = {
        

    //         sanctumAddLiquidity: agent.methods.sanctumAddLiquidity,
    //         sanctumGetLSTAPY: agent.methods.sanctumGetLSTAPY,
    //         sanctumGetLSTPrice: agent.methods.sanctumGetLSTPrice,
    //         sanctumGetLSTTVL: agent.methods.sanctumGetLSTTVL,
    //         sanctumGetOwnedLST: agent.methods.sanctumGetOwnedLST,
    //         sanctumRemoveLiquidity: agent.methods.sanctumRemoveLiquidity,
    //         sanctumSwapLST: agent.methods.sanctumSwapLST,
    //     }


    //     // execute protocol actions
    //     const method = methodList[label]
    //     if (method) {
    //       try {
    //         const txn = await method(...(node.params || [])); // Spread the params array
    //         return txn;
    //       } catch (error) {
    //         console.error(`Error executing method ${node.label}:`, error);
    //         return null;
    //       }
    //     } else {
    //       console.error("Method not found:", node.label);
    //       return null;
    //     }
    // }

}