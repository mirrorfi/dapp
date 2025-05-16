interface ShareConfig {
  text: string;
  url: string;
}

export const shareToTwitter = ({ text, url }: ShareConfig) => {
  const tweetText = encodeURIComponent(`${text}\nCheck it out at:${url}`);
  window.open(`https://x.com/intent/post?text=${tweetText}`, "_blank");
};

// Predefined share configurations
export const createShareConfig = (
  id: string,
  name: string,
  apy: number
): ShareConfig => ({
  text: `I've just discovered an amazing strategy on MirrorFi "${name}" with ${apy.toFixed(
    2
  )}% APY! #JustMirrorIt`,
  url: `http://app.mirrorfi.xyz/strategy-dashboard?id=${id}`,
});

export const shareAPYConfig = (
  name: string,
  profit: string,
  apy:string,
):any =>({
  text: `I've just earned $${profit} from ${name} strategy with ${apy}% APY! #JustMirrorIt`,
  url: `http://app.mirrorfi.xyz`,
})
