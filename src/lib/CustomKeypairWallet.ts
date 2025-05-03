import {
    type ConfirmOptions,
    Connection,
    type Keypair,
    type PublicKey,
    SendOptions,
    type Transaction,
    TransactionSignature,
    VersionedTransaction,
  } from "@solana/web3.js";
  import { SolanaAgentKit, KeypairWallet, BaseWallet } from "solana-agent-kit";



export class CustomKeypairWallet implements BaseWallet {

  readonly publicKey: PublicKey;
  rpcUrl: string;
  connection: Connection;
  wallet: any;
//   signTransaction:

  constructor(rpcUrl: string, wallet: any) {
    this.rpcUrl = rpcUrl;
    this.publicKey = wallet.publicKey;
    this.connection = new Connection(rpcUrl);
  }

  signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> {
    const signTransaction = this.wallet.signTransaction
    if (!signTransaction) {
      throw new Error("signTransaction is not available");
    }
    return signTransaction(transaction);
  }

  signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]> {
    const signAllTransactions = this.wallet.signAllTransactions
    if (!signAllTransactions) {
      throw new Error("signAllTransactions is not available");
    }
    return signAllTransactions(transactions);
  }

  sendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<string> {
    const sendTransaction = this.wallet.sendTransaction
    if (!sendTransaction) {
      throw new Error("sendTransaction is not available");
    }
    return sendTransaction(transaction, this.connection);
  }

  signMessage(message: Uint8Array): Promise<Uint8Array> {
    const signMessage = this.wallet.signMessage
    if (!signMessage) {
      throw new Error("signMessage is not available");
    }
    return signMessage(message);
  }

  signAndSendTransaction: <T extends Transaction | VersionedTransaction>(transaction: T, options?: SendOptions) => Promise<{ 
    signature: TransactionSignature; 
  }> = async (transaction: T, options?: SendOptions) => {
    const signAndSendTransaction = this.wallet.signAndSendTransaction
    if (!signAndSendTransaction) {
      throw new Error("signAndSendTransaction is not available");
    }
    return signAndSendTransaction(transaction, options).then((signature: TransactionSignature) => {
      return { signature };
    });
  }
//   signAndSendTransaction<T extends Transaction | VersionedTransaction>(
//     transaction: T,
//     options?: SendOptions
//   ): Promise<{ signature: string }> {
//     const signAndSendTransaction = this.wallet.signAndSendTransaction;
//     if (!signAndSendTransaction) {
//       throw new Error("signAndSendTransaction is not available");
//     }
//     return signAndSendTransaction(transaction, options).then((signature: string) => {
//       return { signature };
//     });
//   }
}