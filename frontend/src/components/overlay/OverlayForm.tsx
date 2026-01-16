import { useState } from 'react';
import { X, Type, Image, Palette } from 'lucide-react';
import type { OverlayFormData, TextOverlayConfig, ImageOverlayConfig } from '@/types/overlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OverlayFormProps {
  type: 'text' | 'image';
  initialData?: TextOverlayConfig | ImageOverlayConfig;
  onSubmit: (data: OverlayFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const FONT_FAMILIES = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans' },
];

const PRESET_COLORS = [
  '#ffffff', '#00d4ff', '#ff3366', '#ffcc00', '#33ff66', '#ff6600', '#9933ff', '#000000'
];

export function OverlayForm({ type, initialData, onSubmit, onCancel, isEditing }: OverlayFormProps) {
  const [textConfig, setTextConfig] = useState<TextOverlayConfig>(
    type === 'text' && initialData
      ? (initialData as TextOverlayConfig)
      : { text: 'Your text here', fontSize: 24, fontFamily: 'Inter, sans-serif', color: '#ffffff' }
  );

  const [imageConfig, setImageConfig] = useState<ImageOverlayConfig>(
    type === 'image' && initialData
      ? (initialData as ImageOverlayConfig)
      : { imageUrl: '' }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      config: type === 'text' ? textConfig : imageConfig,
    });
  };

  return (
    <div className="glass-panel rounded-xl p-5 animate-scale-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {type === 'text' ? (
            <Type className="w-5 h-5 text-primary" />
          ) : (
            <Image className="w-5 h-5 text-primary" />
          )}
          <h3 className="font-semibold text-lg">
            {isEditing ? 'Edit' : 'Add'} {type === 'text' ? 'Text' : 'Image'} Overlay
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {type === 'text' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="text">Text Content</Label>
              <Input
                id="text"
                value={textConfig.text}
                onChange={(e) => setTextConfig({ ...textConfig, text: e.target.value })}
                placeholder="Enter your overlay text"
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <Label>Font Size: {textConfig.fontSize}px</Label>
              <Slider
                value={[textConfig.fontSize]}
                min={12}
                max={72}
                step={1}
                onValueChange={(value) => setTextConfig({ ...textConfig, fontSize: value[0] })}
              />
            </div>

            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={textConfig.fontFamily}
                onValueChange={(value) => setTextConfig({ ...textConfig, fontFamily: value })}
              >
                <SelectTrigger className="input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Text Color
              </Label>
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setTextConfig({ ...textConfig, color })}
                      className={`w-7 h-7 rounded-lg border-2 transition-all ${
                        textConfig.color === color
                          ? 'border-primary scale-110'
                          : 'border-transparent hover:border-muted-foreground/50'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={textConfig.color}
                  onChange={(e) => setTextConfig({ ...textConfig, color: e.target.value })}
                  className="w-10 h-8 p-0 border-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="bg-black/50 rounded-lg p-4 min-h-[60px] flex items-center justify-center">
                <span
                  style={{
                    fontSize: `${Math.min(textConfig.fontSize, 32)}px`,
                    fontFamily: textConfig.fontFamily,
                    color: textConfig.color,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  }}
                >
                  {textConfig.text || 'Preview text'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageConfig.imageUrl}
                onChange={(e) => setImageConfig({ imageUrl: e.target.value })}
                placeholder="https://example.com/image.png"
                className="input-field"
              />
            </div>

            {/* Preview */}
            {imageConfig.imageUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="bg-black/50 rounded-lg p-4 flex items-center justify-center">
                  <img
                    src={imageConfig.imageUrl}
                    alt="Preview"
                    className="max-h-32 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1 control-button-primary">
            {isEditing ? 'Update' : 'Add'} Overlay
          </Button>
        </div>
      </form>
    </div>
  );
}
