import { useWallet } from "@solana/wallet-adapter-react";
import { FC, useState } from "react";
import { Button } from "./ui/button";
import bs58 from "bs58";

interface TermsOfServiceProps {
  onSign: () => void;
}

export const TermsOfService: FC<TermsOfServiceProps> = ({ onSign }) => {
  const { wallet, connected, publicKey, signMessage } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const TERMS_OF_SERVICE = `WARNING! This is an initial demo of MirrorFi!
PLEASE USE IT AT YOUR OWN RISK!

By signing this message, I agree to the following terms:

1. I understand that using this platform involves financial risks
2. I am responsible for securing my wallet and private keys
3. I accept that transactions cannot be reversed
4. I understand that the platform is not responsible for any losses
5. I accept that the platform is not liable for any damages or losses incurred`;

  const handleSignMessage = async () => {
    if (!wallet || !connected || !publicKey || !signMessage) {
      setError("Wallet not connected");
      return;
    }

    try {
      setError(null);
      const message = new TextEncoder().encode(TERMS_OF_SERVICE);
      const signature = await signMessage(message);
      const encodedSignature = bs58.encode(signature);

      // Store in localStorage
      const storedSignatures = localStorage.getItem("termsSignatures") || "{}";
      const signatures = JSON.parse(storedSignatures);
      signatures[publicKey.toBase58()] = encodedSignature;
      localStorage.setItem("termsSignatures", JSON.stringify(signatures));

      // Notify parent component
      onSign();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to sign message");
      }
    }
  };

  if (!connected) {
    return <div>Please connect your wallet to continue</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-center text-3xl font-bold">Terms of Service</h2>
      <pre className="whitespace-pre-wrap bg-card p-4 rounded-lg">
        {TERMS_OF_SERVICE}
      </pre>
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500">
          <p className="font-medium mb-2">Error</p>
          <p>{error}</p>
        </div>
      )}
      <Button onClick={handleSignMessage} className="w-full">
        Sign Terms of Service
      </Button>
    </div>
  );
};
