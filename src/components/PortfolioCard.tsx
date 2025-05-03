"use client";
import {useWallet, useAnchorWallet} from "@solana/wallet-adapter-react";
import {PublicKey, Connection, clusterApiUrl, Keypair, Transaction, LAMPORTS_PER_SOL} from "@solana/web3.js";
import {Program, AnchorProvider, BN} from "@coral-xyz/anchor";
import { AccountLayout } from "@solana/spl-token";
import { useState, useEffect } from 'react';
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { programs } from "@metaplex/js"
import { deserializeMetadata } from "@metaplex-foundation/mpl-token-metadata";

import {Separator} from "@/components/ui/separator";
// import PortfolioCardData from "@/components/PortfolioCardData";
// import PortfolioCardSolana from "@/components/PortfolioCardSolana";

const RPC_LINK = process.env.NEXT_PUBLIC_RPC_LINK ? process.env.NEXT_PUBLIC_RPC_LINK : clusterApiUrl("devnet");
const connection = new Connection(RPC_LINK);

const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

interface TokenDetails{
    mint: string;
    name: string;
    symbol: string;
    uri: string;
    amount: string;
}

export default function AnchorPortfolioCard(){
    const anchorWallet = useAnchorWallet();
    const [tokenDetails, setTokenDetails] = useState<TokenDetails[]>([]);

    async function getPortfolioData(){
        if(!anchorWallet){
          console.log("Wallet Not Connected!");
          return
        } else {
          console.log("Wallet Connected!");
          console.log("Anchor Wallet:", anchorWallet.publicKey.toString());
        }
        // Get All Token Accounts owned by the wallet
        const tokenAccounts = await connection.getTokenAccountsByOwner(
            anchorWallet.publicKey, 
            { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")},
            "confirmed"
        );
        // console.log(tokenAccounts);

        // Decode the Token Account Data
        const unfliteredTokenData = tokenAccounts.value.map((tokenAccount) => {
            const accountInfo = tokenAccount.account.data;
            const decodedData = AccountLayout.decode(accountInfo);
            // console.log(decodedData);
            return {
                mint: decodedData.mint.toString(),
                owner: decodedData.owner.toString(),
                amount: decodedData.amount.toString(),
            }
        });

        // console.log("Unfiltered Token Data:", unfliteredTokenData);

        // Filter out the Tokens with 0 Balance
        const tokenData = unfliteredTokenData.filter((token) => {
            return Number(token.amount) > 0;
        });
        console.log(tokenData);

        // Fetch the Metadata for each token
        const metadataAccounts = tokenData.map((token) => {
            return PublicKey.findProgramAddressSync(
                [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), new PublicKey(token.mint).toBuffer(),],
                METADATA_PROGRAM_ID,
            )[0];
        });
        const metadataAccountsInfo = await connection.getMultipleAccountsInfo(metadataAccounts, "confirmed");
        console.log(metadataAccountsInfo);
        console.log(metadataAccountsInfo[0]?.owner.toString());
        metadataAccountsInfo.forEach((accountInfo) => {
            const decodedAccountInfo = AccountLayout.decode(accountInfo?.data);
            const metadata = programs.metadata.Metadata.findByMint(connection, new PublicKey(decodedAccountInfo.mint));
            console.log(
              "metadata:", metadata);
        });
        
        const tokenMetadatas = metadataAccountsInfo.map((metadataAccount) => {
            const accountInfo = deserializeMetadata(metadataAccount as any);
            return {
                mint: accountInfo.mint,
                name: accountInfo.name,
                symbol: accountInfo.symbol,
                uri: accountInfo.uri,
            } 
        });
        // console.log(tokenMetadatas);

        const tokenDetails : TokenDetails[] = tokenMetadatas.map((metadata:any, index:number) => {
            return{
                ...metadata,
                amount: tokenData[index].amount,
            }
        });
        // console.log(tokenDetails);
        setTokenDetails(tokenDetails);
        console.log("Token Details:", tokenDetails);
    }

    useEffect(()=>{
        console.log("Calling Fetch Function")
        getPortfolioData();
    }, [anchorWallet]);

    return(<>
        <div className="w-full text-white flex justify-center items-center">
            <div className="w-3/4 px-10 py-4 bg-gray-900 rounded-lg flex flex-col justify-start items-center space-y-4 mb-10">
                <div className="w-full flex flex-col items-center">
                    <h1 className="text-2xl font-semibold text-cyan-300 my-4">Portfolio</h1>
                    <Separator className="bg-blue-500/20" />
                </div>

                {/* <div className="w-full">
                    <PortfolioCardSolana/>
                </div> */}
                
                {/* {tokenDetails.length > 0 ? 
                    tokenDetails.map((token: TokenDetails, key:number) => {
                        return <div key={key} className="w-full">
                            <PortfolioCardData tokenDetail={token}/>
                        </div>;
                    })  
                    : <p>No Tokens Found</p>
                } */}
            </div>
        </div>
    </>)


    
}