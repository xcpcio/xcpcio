import Hls from "hls.js";

export function useHlsPlayer() {
  function initHlsPlayer(
    videoElement: HTMLVideoElement,
    url: string,
    onError: () => void,
  ): Hls | null {
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(url);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          onError();
          hls.destroy();
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play().catch(() => {
          // Autoplay was prevented, user needs to interact
        });
      });

      return hls;
    } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      videoElement.src = url;
      videoElement.addEventListener("error", onError);
      videoElement.play().catch(() => {});
      return null;
    }

    onError();
    return null;
  }

  return { initHlsPlayer };
}
