import { useState } from 'react';
import { Play, Radio, Link2, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StreamHeaderProps {
  streamUrl: string;
  onStreamChange: (url: string) => void;
  isConnected: boolean;
}

export function StreamHeader({ streamUrl, onStreamChange, isConnected }: StreamHeaderProps) {
  const [inputUrl, setInputUrl] = useState(streamUrl);

  const handleConnect = () => {
    onStreamChange(inputUrl);
  };

  const loadDemo = () => {
    const demoUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
    setInputUrl(demoUrl);
    onStreamChange(demoUrl);
  };

  const loadLocalStream = () => {
    const localUrl = 'http://localhost:5000/stream.m3u8';
    setInputUrl(localUrl);
    onStreamChange(localUrl);
  };

  return (
    <header className="glass-panel border-b border-border px-6 py-4">
      <div className="flex items-center justify-between gap-6 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0FCAF0] flex items-center justify-center shadow-glow">
            <Radio className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">StreamOverlay</h1>
            <p className="text-xs text-muted-foreground">RTSP Livestream Manager</p>
          </div>
        </div>

        {/* Stream URL input */}
        <div className="flex-1 max-w-2xl flex items-center gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Enter HLS/RTSP stream URL..."
              className="input-field pl-10 pr-4"
            />
          </div>
          <Button onClick={handleConnect} className="control-button-primary bg-[#0FCAF0] hover:bg-[#0FCAF0]/80 cursor-pointer">
            <Play className="w-4 h-4" />
            Connect
          </Button>
          <Button onClick={loadLocalStream} variant="outline" className="whitespace-nowrap cursor-pointer">
            Local Stream
          </Button>
          <Button onClick={loadDemo} variant="outline" className="whitespace-nowrap cursor-pointer">
            Demo Stream
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected ? 'bg-success animate-pulse-subtle' : 'bg-muted-foreground'
            }`}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {isConnected && (
            <Wifi className="w-4 h-4 text-success ml-1" />
          )}
        </div>
      </div>
    </header>
  );
}
