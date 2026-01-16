import { useState } from 'react';
import {
  Type,
  Image,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Layers,
  Move,
  X,
} from 'lucide-react';
import type { Overlay, TextOverlayConfig, ImageOverlayConfig, OverlayFormData } from '@/types/overlay';
import { OverlayForm } from '@/components/overlay/OverlayForm';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ControlPanelProps {
  overlays: Overlay[];
  selectedOverlay: Overlay | null;
  isOpen: boolean;
  onToggle: () => void;
  onAddOverlay: (data: OverlayFormData) => void;
  onUpdateConfig: (id: string, config: TextOverlayConfig | ImageOverlayConfig) => void;
  onDeleteOverlay: (id: string) => void;
  onSelectOverlay: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onUpdateOpacity: (id: string, opacity: number) => void;
}

export function ControlPanel({
  overlays,
  selectedOverlay,
  isOpen,
  onToggle,
  onAddOverlay,
  onUpdateConfig,
  onDeleteOverlay,
  onSelectOverlay,
  onBringToFront,
  onSendToBack,
  onUpdateOpacity,
}: ControlPanelProps) {
  const [showForm, setShowForm] = useState<'text' | 'image' | null>(null);
  const [editingOverlay, setEditingOverlay] = useState<Overlay | null>(null);

  const handleAddOverlay = (data: OverlayFormData) => {
    onAddOverlay(data);
    setShowForm(null);
  };

  const handleEditSubmit = (data: OverlayFormData) => {
    if (editingOverlay) {
      onUpdateConfig(editingOverlay.id, data.config);
      setEditingOverlay(null);
    }
  };

  const startEdit = (overlay: Overlay) => {
    setEditingOverlay(overlay);
    setShowForm(null);
  };

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full bg-card/95 backdrop-blur-xl border-l border-border transition-all duration-300 z-50 flex flex-col',
        isOpen ? 'w-80' : 'w-0'
      )}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -left-10 top-1/2 -translate-y-1/2 w-10 h-20 bg-card/95 backdrop-blur-xl border border-border border-r-0 rounded-l-lg flex items-center justify-center hover:bg-secondary transition-colors"
      >
        <Layers className={cn('w-5 h-5 transition-transform', !isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Overlay Manager
            </h2>
          </div>

          {/* Add buttons */}
          <div className="p-4 border-b border-border">
            <div className="flex gap-2">
              <Button
                onClick={() => { setShowForm('text'); setEditingOverlay(null); }}
                className="flex-1 control-button"
                variant="secondary"
              >
                <Type className="w-4 h-4" />
                Add Text
              </Button>
              <Button
                onClick={() => { setShowForm('image'); setEditingOverlay(null); }}
                className="flex-1 control-button"
                variant="secondary"
              >
                <Image className="w-4 h-4" />
                Add Image
              </Button>
            </div>
          </div>

          {/* Form */}
          {(showForm || editingOverlay) && (
            <div className="p-4 border-b border-border">
              <OverlayForm
                type={editingOverlay?.type || showForm!}
                initialData={editingOverlay?.config}
                isEditing={!!editingOverlay}
                onSubmit={editingOverlay ? handleEditSubmit : handleAddOverlay}
                onCancel={() => {
                  setShowForm(null);
                  setEditingOverlay(null);
                }}
              />
            </div>
          )}

          {/* Selected overlay controls */}
          {selectedOverlay && !editingOverlay && (
            <div className="p-4 border-b border-border space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm text-muted-foreground">Selected Overlay</h3>
                <button
                  onClick={() => onSelectOverlay('')}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Position info */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
                <Move className="w-3 h-3" />
                <span>X: {Math.round(selectedOverlay.position.x)}</span>
                <span>Y: {Math.round(selectedOverlay.position.y)}</span>
                <span className="ml-auto">
                  {Math.round(selectedOverlay.size.width)} × {Math.round(selectedOverlay.size.height)}
                </span>
              </div>

              {/* Opacity */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  {selectedOverlay.opacity > 0 ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Opacity: {Math.round(selectedOverlay.opacity * 100)}%
                </label>
                <Slider
                  value={[selectedOverlay.opacity * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => onUpdateOpacity(selectedOverlay.id, value[0] / 100)}
                />
              </div>

              {/* Z-index controls */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBringToFront(selectedOverlay.id)}
                  className="flex-1"
                >
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Front
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendToBack(selectedOverlay.id)}
                  className="flex-1"
                >
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(selectedOverlay)}
                  className="flex-1"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteOverlay(selectedOverlay.id)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Overlay list */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-medium text-muted-foreground">
                Overlays ({overlays.length})
              </h3>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {overlays.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Layers className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No overlays yet</p>
                    <p className="text-xs mt-1">Add text or image overlays above</p>
                  </div>
                ) : (
                  overlays.map((overlay) => (
                    <div
                      key={overlay.id}
                      onClick={() => onSelectOverlay(overlay.id)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all',
                        selectedOverlay?.id === overlay.id
                          ? 'bg-primary/20 border border-primary/30'
                          : 'hover:bg-secondary/50 border border-transparent'
                      )}
                    >
                      <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                        {overlay.type === 'text' ? (
                          <Type className="w-4 h-4 text-primary" />
                        ) : (
                          <Image className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {overlay.type === 'text'
                            ? (overlay.config as TextOverlayConfig).text
                            : 'Image Overlay'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(overlay.position.x)}, {Math.round(overlay.position.y)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(overlay);
                          }}
                          className="p-1.5 rounded hover:bg-secondary transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteOverlay(overlay.id);
                          }}
                          className="p-1.5 rounded hover:bg-destructive/20 text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}
