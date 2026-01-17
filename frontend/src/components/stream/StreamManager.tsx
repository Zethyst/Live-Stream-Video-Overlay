import { useState } from 'react';
import { Play, Square, RotateCw, Radio, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStream } from '@/hooks/useStream';

interface StreamManagerProps {
  onStreamReady: (hlsUrl: string) => void;
}

export function StreamManager({ onStreamReady }: StreamManagerProps) {
  const { streamStatus, isLoading, startStream, stopStream, restartStream } = useStream();
  const [rtspUrl, setRtspUrl] = useState('rtsp://localhost:8554/mystream');

  const handleStart = async () => {
    const result = await startStream(rtspUrl);
    if (result.success && result.hls_url) {
      // Construct full HLS URL
      const fullHlsUrl = `http://localhost:3001${result.hls_url}`;
      onStreamReady(fullHlsUrl);
    }
  };

  const handleStop = async () => {
    await stopStream();
    onStreamReady('');
  };

  const handleRestart = async () => {
    await restartStream();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Radio className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">RTSP Stream Manager</h3>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 text-sm">
        <div
          className={`w-2 h-2 rounded-full ${
            streamStatus.is_running ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`}
        />
        <span className="text-muted-foreground">
          {streamStatus.is_running ? 'Stream Running' : 'Stream Stopped'}
        </span>
      </div>

      {streamStatus.is_running && streamStatus.rtsp_url && (
        <div className="text-xs text-muted-foreground bg-secondary/50 rounded px-3 py-2">
          <span className="font-medium">Source:</span> {streamStatus.rtsp_url}
        </div>
      )}

      {/* RTSP URL Input */}
      {!streamStatus.is_running && (
        <div className="space-y-2">
          <Label htmlFor="rtsp-url">RTSP URL</Label>
          <Input
            id="rtsp-url"
            value={rtspUrl}
            onChange={(e) => setRtspUrl(e.target.value)}
            placeholder="rtsp://localhost:8554/mystream"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Examples: rtsp://localhost:8554/stream or rtsp://admin:pass@192.168.1.100:554/stream
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!streamStatus.is_running ? (
          <Button
            onClick={handleStart}
            disabled={isLoading || !rtspUrl}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Stream
              </>
            )}
          </Button>
        ) : (
          <>
            <Button
              onClick={handleRestart}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RotateCw className="w-4 h-4 mr-2" />
              )}
              Restart
            </Button>
            <Button
              onClick={handleStop}
              disabled={isLoading}
              variant="destructive"
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Square className="w-4 h-4 mr-2" />
              )}
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Quick presets */}
      {!streamStatus.is_running && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Quick Presets:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRtspUrl('rtsp://localhost:8554/mystream')}
              className="text-xs"
            >
              Local (8554)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRtspUrl('rtsp://localhost:8080/stream')}
              className="text-xs"
            >
              Local (8080)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
