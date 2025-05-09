export const protocolOptions = ["Raydium", "Orca", "Kamino", "Drift", "Sanctum"];

export const tokenMintAddresses: Record<string, string> = {
    "SOL": "So11111111111111111111111111111111111111112",
    "USDC": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "USDT": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    "PYUSD": "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    "FDUSD": "9zNQRsGLjNKwCUU5Gq5LR8beUCPzQMVMqKAi3SSZh54u",
    "USDS": "USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA",
};

export const LSTMintAddresses: Record<string, string> = {  
    "JupSOL": "jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v",
    "JitoSOL": "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
    "BNSOL": "BNso1VUJnh4zcfpZa6986Ea66P6TCp59hvtNJ8b1X85",
    "mSOL": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    "bbSOL": "Bybit2vBJGhPF52GBdNaQfUJ6ZpThSgHBobjWZpLPb4B",
    "xandSOL": "XAnDeUmMcqFyCdef9jzpNgtZPjTj3xUMj9eXKn2reFN",
};

export const tokenOptions = Object.keys(tokenMintAddresses);
export const LSToptions = Object.keys(LSTMintAddresses);