export async function getTokenBalances(pubKey: string, tokenAddresses: string[]) {
  const params = new URLSearchParams();
  params.append('pubKey', pubKey);

  tokenAddresses.forEach((token) => {
    if(!token) {
        throw new Error("Token address invalid");
    }
    params.append('tokenHashes', token);
  });

  console.log(params.toString());
  const res = await fetch(`/api/balances?${params.toString()}`);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  const data = await res.json();
  console.log("Token Balances:", data);
  return data;
}