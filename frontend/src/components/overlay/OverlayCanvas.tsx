import { useRef, useEffect, useState } from 'react';
import type { Overlay } from '@/types/overlay';
import { OverlayItem } from './OverlayItem';

interface OverlayCanvasProps {
  overlays: Overlay[];
  selectedOverlayId: string | null;
  onSelectOverlay: (id: string | null) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateSize: (id: string, width: number, height: number) => void;
  onDeleteOverlay: (id: string) => void;
}

export function OverlayCanvas({
  overlays,
  selectedOverlayId,
  onSelectOverlay,
  onUpdatePosition,
  onUpdateSize,
  onDeleteOverlay,
}: OverlayCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateBounds = () => {
      if (containerRef.current) {
        setBounds({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  const handleCanvasClick = () => {
    onSelectOverlay(null);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      onClick={handleCanvasClick}
    >
      {overlays.map((overlay) => (
        <OverlayItem
          key={overlay.id}
          overlay={overlay}
          isSelected={overlay.id === selectedOverlayId}
          containerBounds={bounds}
          onSelect={() => onSelectOverlay(overlay.id)}
          onPositionChange={(x, y) => onUpdatePosition(overlay.id, x, y)}
          onSizeChange={(width, height) => onUpdateSize(overlay.id, width, height)}
          onDelete={() => onDeleteOverlay(overlay.id)}
        />
      ))}
    </div>
  );
}
