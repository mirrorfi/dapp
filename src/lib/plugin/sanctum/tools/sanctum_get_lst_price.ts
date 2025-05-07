import axios from "redaxios";
import { SANCTUM_STAT_API_URI } from "../constants";
import { SolanaAgentKit } from "solana-agent-kit";

/**
 * @param inputs: Array of mint addresses or symbols of the LST to get price for registered in sanctum
 * @returns Price of the mints
 */

export async function sanctumGetLSTPrice( 
  agent: SolanaAgentKit,
  inputs: string[],
): Promise<{ mint: string; amount: number }[]> {
  try {
    const client = axios.create({
      baseURL: SANCTUM_STAT_API_URI,
    });

    console.log("HERE ARE THE AGENT:", agent);
    console.log("HERE ARE THE INPUS:", inputs);

    const response = await client.get("/v1/sol-value/current", {
      params: {
        lst: inputs,
      },
      paramsSerializer: (params) => {
        console.log("HERE ARE THE PARAMS:", params);
        // Ensure params.lst is an array before calling .map()
        if (Array.isArray(params.lst)) {
          return (params.lst as string[])
            .map((value: string) => `lst=${encodeURIComponent(value)}`)
            .join("&");
        }
        throw new Error("params.lst must be an array");
      },
    });

    const result = response.data.solValues;

    return result;
  } catch (error: any) {
    throw new Error(`Failed to get price: ${error.message}`);
  }
}