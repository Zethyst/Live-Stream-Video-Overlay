import { useState, useEffect } from 'react';
import { StreamHeader } from '@/components/header/StreamHeader';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { OverlayCanvas } from '@/components/overlay/OverlayCanvas';
import { ControlPanel } from '@/components/control/ControlPanel';
import { StreamManager } from '@/components/stream/StreamManager';
import { useOverlays } from '@/hooks/useOverlays';
import { Toaster } from '@/components/ui/sonner';
import { Keyboard, Mouse } from 'lucide-react';

const Index = () => {
  const [streamUrl, setStreamUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const {
    overlays,
    selectedOverlay,
    selectedOverlayId,
    setSelectedOverlayId,
    addOverlay,
    updateOverlayPosition,
    updateOverlaySize,
    updateOverlayConfig,
    deleteOverlay,
    bringToFront,
    sendToBack,
    updateOpacity,
  } = useOverlays();

  // Handle stream connection
  const handleStreamChange = (url: string) => {
    setStreamUrl(url);
    setIsConnected(!!url);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedOverlayId) {
        deleteOverlay(selectedOverlayId);
      }
      if (e.key === 'Escape') {
        setSelectedOverlayId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOverlayId, deleteOverlay, setSelectedOverlayId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="bottom-right" />
      
      <StreamHeader
        streamUrl={streamUrl}
        onStreamChange={handleStreamChange}
        isConnected={isConnected}
      />

      <main className="flex-1 flex">
        <div 
          className="flex-1 p-6 transition-all duration-300"
          style={{ marginRight: isPanelOpen ? '320px' : '0' }}
        >
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Stream Manager */}
            <StreamManager onStreamReady={(url) => handleStreamChange(url)} />

            {/* Video Player */}
            <VideoPlayer streamUrl={streamUrl}>
              <OverlayCanvas
                overlays={overlays}
                selectedOverlayId={selectedOverlayId}
                onSelectOverlay={setSelectedOverlayId}
                onDeleteOverlay={deleteOverlay}
                onUpdatePosition={(id, x, y) => updateOverlayPosition(id, { x, y })}
                onUpdateSize={(id, width, height) => updateOverlaySize(id, { width, height })}
              />
            </VideoPlayer>

            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mouse className="w-4 h-4" />
                <span>Drag overlays to reposition • Drag corners to resize</span>
              </div>
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4" />
                <span>Delete: Remove selected • Esc: Deselect</span>
              </div>
            </div>
          </div>
        </div>

        <ControlPanel
          overlays={overlays}
          selectedOverlay={selectedOverlay}
          isOpen={isPanelOpen}
          onToggle={() => setIsPanelOpen(!isPanelOpen)}
          onAddOverlay={addOverlay}
          onUpdateConfig={updateOverlayConfig}
          onDeleteOverlay={deleteOverlay}
          onSelectOverlay={setSelectedOverlayId}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
          onUpdateOpacity={updateOpacity}
        />
      </main>
    </div>
  );
};

export default Index;
