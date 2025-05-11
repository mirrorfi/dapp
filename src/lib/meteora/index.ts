import DLMM, { PairStatus } from '@meteora-ag/dlmm'
import { Connection, PublicKey } from '@solana/web3.js';

const RPC_LINK = process.env.NEXT_PUBLIC_RPC_LINK || "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC_LINK);

// Return the Highest TVL Pool for a Token Pair
export async function getPool(tokenXAddress: string, tokenYAddress: string) {
    const response = await fetch(`https://dlmm-api.meteora.ag/pair/all_by_groups?include_pool_token_pairs=${tokenXAddress}-${tokenYAddress}`);
    const data = await response.json();
    return data.groups[0];
}


// Get all the user positions
export async function getAllUserPositions(userPublicKey: PublicKey) {
    const positions = await DLMM.getAllLbPairPositionsByUser(connection, userPublicKey);
    console.log("All User Positions:", positions);

    const userPortfolio: any = [];

    positions.forEach(async (position: any) => {
        console.log(position);
        console.log("Pair Public Key:", position.publicKey.toBase58());

        const pairAddress = position.publicKey.toBase58();
        const pairStatRes = await fetch(`https://dlmm-api.meteora.ag/pair/${pairAddress}`);
        const pairStats = await pairStatRes.json();
        
        const tokenX = position.tokenX;
        const tokenY = position.tokenY;
        const positionsData = position.lbPairPositionsData;

        positionsData.forEach((data: any) => {
            const positionData = data.positionData;
            console.log("Token X:", tokenX);
            console.log("Token Y:", tokenY);
            console.log("Token X Mint:", tokenX.mint.address.toString());
            console.log("Token Y Mint:", tokenY.mint.address.toString());
            console.log("Token X Decimal:", tokenX.mint.decimals);
            console.log("Token Y Decimal:", tokenY.mint.decimals);

            // console.log("Position Public Key?:", positionData.publicKey.toString());
            console.log("Position Data:", positionData);

            const profitX = positionData.feeX.toString();
            const profitY = positionData.feeY.toString();
            console.log("Total Fee X:", profitX);
            console.log("Total Fee Y:", profitY);

            const positionX = positionData.totalXAmount.toString();
            const positionY = positionData.totalYAmount.toString();
            console.log("Total Amount X:", positionX);
            console.log("Total Amount Y:", positionY);

            userPortfolio.push({
                pairAddress: position.publicKey.toBase58(),
                apy: pairStats.apy,
                apr: pairStats.apr,
                tvl: pairStats.tvl,
                yield_24h: pairStats.apr,
                fees_24h: pairStats.fees_24h,
                volume_24h: pairStats.trade_volume_24h,
                tokenX: tokenX.mint.address.toString(),
                tokenY: tokenY.mint.address.toString(),
                tokenXDecimal: tokenX.mint.decimals,
                tokenYDecimal: tokenY.mint.decimals,
                profitX: profitX,
                profitY: profitY,
                positionX: positionX,
                positionY: positionY,
                tokenXReserve: pairStats.reserve_x_amount,
                tokenYReserve: pairStats.reserve_y_amount,
            });
        });
    });
    return userPortfolio;
}



/*
Alternatives:
1. Store List of Available Pools in Database
2. Store the positions of each users in the database
3. Only Allow several default pools
*/