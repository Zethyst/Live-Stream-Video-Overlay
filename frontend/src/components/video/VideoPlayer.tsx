import { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  streamUrl: string;
  children?: React.ReactNode;
}

export function VideoPlayer({ streamUrl, children }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setIsLoading(true);
    setError(null);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('Failed to load stream');
          setIsLoading(false);
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      });
    }
  }, [streamUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const vol = value[0];
    video.volume = vol / 100;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="video-container relative aspect-video w-full group"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        playsInline
      />

      {/* Overlay canvas */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          {children}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Loading stream...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <p className="text-destructive font-medium">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">Check the stream URL and try again</p>
          </div>
        </div>
      )}

      {/* No stream placeholder */}
      {!streamUrl && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#0837406f] flex items-center justify-center mx-auto mb-4">
              <Play className="w-10 h-10 text-[#0FCAF0]" />
            </div>
            <p className="text-lg font-medium text-foreground">No Stream Connected</p>
            <p className="text-sm text-muted-foreground mt-1">Enter a stream URL to begin</p>
          </div>
        </div>
      )}

      {/* Video controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="cursor-pointer w-10 h-10 rounded-full bg-[#064450c5] hover:bg-[#064450c5]/80 flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-[#0FCAF0]" />
            ) : (
              <Play className="w-5 h-5 text-[#0FCAF0] ml-0.5" />
            )}
          </button>

          <button
            onClick={toggleMute}
            className="cursor-pointer w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <div className="w-24">
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={100}
              step={1}
              color='#0FCAF0'
              onValueChange={handleVolumeChange}
              className="cursor-pointer"
            />
          </div>

          <div className="flex-1" />

          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
