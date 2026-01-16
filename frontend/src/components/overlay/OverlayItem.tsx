import { useRef, useCallback } from 'react';
import Draggable, { type DraggableData, type DraggableEvent } from 'react-draggable';
import { Resizable, type ResizeDirection } from 're-resizable';
import type { Overlay, TextOverlayConfig, ImageOverlayConfig } from '@/types/overlay';
import { cn } from '@/lib/utils';

interface OverlayItemProps {
  overlay: Overlay;
  isSelected: boolean;
  containerBounds: { width: number; height: number };
  onSelect: () => void;
  onPositionChange: (x: number, y: number) => void;
  onSizeChange: (width: number, height: number) => void;
  onDelete: () => void;
}

export function OverlayItem({
  overlay,
  isSelected,
  containerBounds,
  onSelect,
  onPositionChange,
  onSizeChange,
}: OverlayItemProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleDrag = useCallback(
    (_: DraggableEvent, data: DraggableData) => {
      onPositionChange(data.x, data.y);
    },
    [onPositionChange]
  );

  const handleResize = useCallback(
    (
      _: MouseEvent | TouchEvent,
      __: ResizeDirection,
      ref: HTMLElement
    ) => {
      onSizeChange(ref.offsetWidth, ref.offsetHeight);
    },
    [onSizeChange]
  );

  const renderContent = () => {
    if (overlay.type === 'text') {
      const config = overlay.config as TextOverlayConfig;
      return (
        <div
          style={{
            fontSize: `${config.fontSize}px`,
            fontFamily: config.fontFamily,
            color: config.color,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
          className="w-full h-full flex items-center justify-center p-2"
        >
          {config.text}
        </div>
      );
    } else {
      const config = overlay.config as ImageOverlayConfig;
      return (
        <img
          src={config.imageUrl}
          alt="Overlay"
          className="w-full h-full object-contain"
          draggable={false}
        />
      );
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: overlay.position.x, y: overlay.position.y }}
      onDrag={handleDrag}
      bounds="parent"
      cancel=".resize-handle"
    >
      <div
        ref={nodeRef}
        style={{
          position: 'absolute',
          zIndex: overlay.zIndex,
          opacity: overlay.opacity,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <Resizable
          size={{ width: overlay.size.width, height: overlay.size.height }}
          onResize={handleResize}
          minWidth={50}
          minHeight={30}
          maxWidth={containerBounds.width - overlay.position.x}
          maxHeight={containerBounds.height - overlay.position.y}
          handleClasses={{
            bottomRight: 'resize-handle',
            bottomLeft: 'resize-handle',
            topRight: 'resize-handle',
            topLeft: 'resize-handle',
          }}
          enable={{
            top: isSelected,
            right: isSelected,
            bottom: isSelected,
            left: isSelected,
            topRight: isSelected,
            bottomRight: isSelected,
            bottomLeft: isSelected,
            topLeft: isSelected,
          }}
        >
          <div
            className={cn(
              'w-full h-full cursor-move relative group transition-all duration-150',
              isSelected && 'ring-2 ring-primary ring-offset-1 ring-offset-transparent'
            )}
          >
            {renderContent()}

            {/* Resize handles */}
            {isSelected && (
              <>
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full cursor-nw-resize resize-handle" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full cursor-ne-resize resize-handle" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full cursor-sw-resize resize-handle" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full cursor-se-resize resize-handle" />
              </>
            )}
          </div>
        </Resizable>
      </div>
    </Draggable>
  );
}
