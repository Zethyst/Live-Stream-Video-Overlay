export interface TextOverlayConfig {
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
  }
  
  export interface ImageOverlayConfig {
    imageUrl: string;
  }
  
  export interface OverlayPosition {
    x: number;
    y: number;
  }
  
  export interface OverlaySize {
    width: number;
    height: number;
  }
  
  export interface Overlay {
    id: string;
    type: 'text' | 'image';
    position: OverlayPosition;
    size: OverlaySize;
    config: TextOverlayConfig | ImageOverlayConfig;
    zIndex: number;
    opacity: number;
  }
  
  export interface OverlayFormData {
    type: 'text' | 'image';
    config: TextOverlayConfig | ImageOverlayConfig;
  }
  