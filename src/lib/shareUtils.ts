interface ShareConfig {
  text: string;
  url: string;
}

export const shareToTwitter = ({ text, url }: ShareConfig) => {
  const tweetText = encodeURIComponent(`${text}\n\n${url}`);
  window.open(`https://x.com/intent/post?text=${tweetText}`, "_blank");
};

// Predefined share configurations
export const createStrategyShareConfig = (
  strategyName: string,
  strategyId: string,
  apy: number
): ShareConfig => ({
  text: `I've just discovered an amazing strategy on MirrorFi "${strategyName}" with ${apy.toFixed(
    2
  )}% APY! #JustMirrorIt`,
  url: `https://app.mirrorfi.xyz/strategy-dashboard/${strategyId}`,
});

export const createPoolShareConfig = (
  pairAddress: string,
  yieldUSD: number,
  apy: number
): ShareConfig => ({
  text: `I've just earned $${yieldUSD.toFixed(
    2
  )} yield from ${pairAddress} pool with ${apy.toFixed(2)}% APY! #JustMirrorIt`,
  url: `https://www.meteora.ag/dlmm/${pairAddress}`,
});
