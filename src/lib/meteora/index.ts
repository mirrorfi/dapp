import DLMM, { PairStatus } from '@meteora-ag/dlmm'
import { Connection, PublicKey } from '@solana/web3.js';

const RPC_LINK = process.env.NEXT_PUBLIC_RPC_LINK || "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC_LINK);

// Return the Highest TVL Pool for a Token Pair
export async function getPool(tokenXAddress: string, tokenYAddress: string) {
    const response = await fetch(`https://dlmm-api.meteora.ag/pair/all_by_groups?include_pool_token_pairs=${tokenXAddress}-${tokenYAddress}`);
    const data = await response.json();
    //console.log("Pool Data:", data);
    return data.groups[0];
}

// Get the APY of a Meteora Position
export async function getMeteoraPoolAPY(tokenXAddress: string, tokenYAddress: string) {
    // console.log("Fetching Meteora Pool APY...");
    const pool = await getPool(tokenXAddress, tokenYAddress);
    //console.log("Inner Pool Data:", pool);
    return pool.pairs[0].apr * 365;
}

// Get all the user positions
export async function getAllUserPositions(userPublicKey: PublicKey) {
    const positions = await DLMM.getAllLbPairPositionsByUser(connection, userPublicKey);
    //console.log("All User Positions:", positions);

    const userPortfolio: any = [];

    positions.forEach(async (position: any) => {
        //console.log(position);
        //console.log("Pair Public Key:", position.publicKey.toBase58());

        const pairAddress = position.publicKey.toBase58();
        const pairStatRes = await fetch(`https://dlmm-api.meteora.ag/pair/${pairAddress}`);
        const pairStats = await pairStatRes.json();
        
        const tokenX = position.tokenX;
        const tokenY = position.tokenY;
        const tokenX_info_res:any = await fetch(`https://api.solana.fm/v0/tokens/${tokenX.mint.address.toString()}`);
        const tokenY_info_res:any = await fetch(`https://api.solana.fm/v0/tokens/${tokenY.mint.address.toString()}`);
        const tokenX_info_json = await tokenX_info_res.json();
        const tokenY_info_json = await tokenY_info_res.json();
        const tokenX_info = tokenX_info_json.result.data;
        const tokenY_info = tokenY_info_json.result.data;
        //console.log("Token X Info:", tokenX_info);
        //console.log("Token Y Info:", tokenY_info);

        const tokenX_symbol = tokenX_info.symbol === "wSOL" ? "SOL" : tokenX_info.symbol;
        const tokenY_symbol = tokenY_info.symbol === "wSOL" ? "SOL" : tokenY_info.symbol;

        const price_res = await fetch(`https://lite-api.jup.ag/price/v2?ids=${tokenX.mint.address.toString()},${tokenY.mint.address.toString()}`);
        const price_data = await price_res.json();
        const priceX = Number(price_data.data[tokenX.mint.address.toString()].price);
        const priceY = Number(price_data.data[tokenY.mint.address.toString()].price);

        //console.log("Price X:", priceX);
        //console.log("Price Y:", priceY);


        const positionsData = position.lbPairPositionsData;
        positionsData.forEach((data: any) => {
            const positionData = data.positionData;
            // console.log("Token X:", tokenX);
            // console.log("Token Y:", tokenY);
            // console.log("Token X Mint:", tokenX.mint.address.toString());
            // console.log("Token Y Mint:", tokenY.mint.address.toString());
            // console.log("Token X Decimal:", tokenX.mint.decimals);
            // console.log("Token Y Decimal:", tokenY.mint.decimals);
            // console.log("Token X Info:", tokenX_info);
            // console.log("Token Y Info:", tokenY_info);

            // console.log("Position Public Key?:", positionData.publicKey.toString());
            // console.log("Position Data:", positionData);

            const profitX = positionData.feeX.toNumber();
            const profitY = positionData.feeY.toNumber();
            const positionX = positionData.totalXAmountExcludeTransferFee.toNumber();
            const positionY = positionData.totalYAmountExcludeTransferFee.toNumber();

            userPortfolio.push({
                pairName: `${tokenX_symbol}-${tokenY_symbol}`,
                pairAddress: position.publicKey.toBase58(),
                apy: pairStats.apr*365,
                apr: pairStats.apr,
                yield_24h: pairStats.apr,
                fees_24h: pairStats.fees_24h,
                volume_24h: pairStats.trade_volume_24h,
                tokenXMint: tokenX.mint.address.toString(),
                tokenYMint: tokenY.mint.address.toString(),
                tokenXDecimal: tokenX.mint.decimals,
                tokenYDecimal: tokenY.mint.decimals,
                tokenXSymbol: tokenX_symbol,
                tokenYSymbol: tokenY_symbol,
                tokenXPrice: priceX,
                tokenYPrice: priceY,
                tokenXLogo: tokenX_info.logo,
                tokenYLogo: tokenY_info.logo,
                profitX: profitX,
                profitY: profitY,
                profitXUSD: profitX * priceX / 10**tokenX.mint.decimals,
                profitYUSD: profitY * priceY / 10**tokenY.mint.decimals,
                positionX: positionX,
                positionY: positionY,
                positionXUSD: positionX * priceX / 10**tokenX.mint.decimals,
                positionYUSD: positionY * priceY / 10**tokenY.mint.decimals,
                reserveX: pairStats.reserve_x_amount,
                reserveY: pairStats.reserve_y_amount,
                reserveXUSD: pairStats.reserve_x_amount * priceX / 10**tokenX.mint.decimals,
                reserveYUSD: pairStats.reserve_y_amount * priceY / 10**tokenY.mint.decimals,
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