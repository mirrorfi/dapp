import { LSTMintAddresses, LSToptions } from "@/constants/nodeOptions"
import { sanctumGetLSTAPY } from "./sanctum_get_lst_apy"

export const APYVals = async (): Promise<Record<string, number>> => {
  const mintAddresses = LSToptions.map((token) => {
    const mintAddress = LSTMintAddresses[token]
    return mintAddress
  })
  
  const apyData = await sanctumGetLSTAPY(mintAddresses)
  const apys: Record<string, number> = {}
  for (const token of LSToptions) {
    const mintAddress = LSTMintAddresses[token]
    if (apyData[mintAddress]) {
      apys[token] = apyData[mintAddress]
    } else {
      apys[token] = 0
    }
  }

  return apys
}