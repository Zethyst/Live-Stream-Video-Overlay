import { useState, useCallback, useEffect, useRef } from 'react';
import type { Overlay, OverlayPosition, OverlaySize, OverlayFormData, TextOverlayConfig, ImageOverlayConfig } from '@/types/overlay';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE;
console.log('API_BASE', API_BASE);

// Demo overlays for initial state
const demoOverlays: Overlay[] = [];

export function useOverlays() {
  const [overlays, setOverlays] = useState<Overlay[]>(demoOverlays);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Fetch overlays from API
  const fetchOverlays = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/overlays`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setOverlays(data);
        }
      }
    } catch (error) {
      console.log('API not available, using local state');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverlays();
  }, [fetchOverlays]);

  // Add new overlay
  const addOverlay = useCallback(async (formData: OverlayFormData) => {
    const newOverlay: Overlay = {
      id: uuidv4(),
      type: formData.type,
      position: { x: 50, y: 50 },
      size: formData.type === 'text' 
        ? { width: 200, height: 50 }
        : { width: 150, height: 100 },
      config: formData.config,
      zIndex: overlays.length + 1,
      opacity: 1,
    };

    setOverlays(prev => [...prev, newOverlay]);
    setSelectedOverlayId(newOverlay.id);

    try {
      await fetch(`${API_BASE}/overlays`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOverlay),
      });
    } catch (error) {
      console.log('API not available, saved locally');
    }

    toast.success('Overlay added successfully!');
    return newOverlay;
  }, [overlays.length]);

  // Update overlay position with debounce
  const updateOverlayPosition = useCallback((id: string, position: OverlayPosition) => {
    setOverlays(prev => prev.map(o => 
      o.id === id ? { ...o, position } : o
    ));

    // Debounce API call
    const existingTimer = debounceTimers.current.get(`pos-${id}`);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(async () => {
      try {
        await fetch(`${API_BASE}/overlays/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ position }),
        });
      } catch (error) {
        console.log('API not available');
      }
    }, 300);

    debounceTimers.current.set(`pos-${id}`, timer);
  }, []);

  // Update overlay size with debounce
  const updateOverlaySize = useCallback((id: string, size: OverlaySize) => {
    setOverlays(prev => prev.map(o => 
      o.id === id ? { ...o, size } : o
    ));

    const existingTimer = debounceTimers.current.get(`size-${id}`);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(async () => {
      try {
        await fetch(`${API_BASE}/overlays/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ size }),
        });
      } catch (error) {
        console.log('API not available');
      }
    }, 300);

    debounceTimers.current.set(`size-${id}`, timer);
  }, []);

  // Update overlay config
  const updateOverlayConfig = useCallback(async (id: string, config: TextOverlayConfig | ImageOverlayConfig) => {
    setOverlays(prev => prev.map(o => 
      o.id === id ? { ...o, config } : o
    ));

    try {
      await fetch(`${API_BASE}/overlays/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
    } catch (error) {
      console.log('API not available');
    }

    toast.success('Overlay updated!');
  }, []);

  // Delete overlay
  const deleteOverlay = useCallback(async (id: string) => {
    setOverlays(prev => prev.filter(o => o.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);

    try {
      await fetch(`${API_BASE}/overlays/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.log('API not available');
    }

    toast.success('Overlay deleted!');
  }, [selectedOverlayId]);

  // Bring overlay to front
  const bringToFront = useCallback((id: string) => {
    const maxZ = Math.max(...overlays.map(o => o.zIndex), 0);
    setOverlays(prev => prev.map(o => 
      o.id === id ? { ...o, zIndex: maxZ + 1 } : o
    ));
  }, [overlays]);

  // Send overlay to back
  const sendToBack = useCallback((id: string) => {
    setOverlays(prev => prev.map(o => 
      o.id === id ? { ...o, zIndex: 0 } : o
    ));
  }, []);

  // Update opacity
  const updateOpacity = useCallback((id: string, opacity: number) => {
    setOverlays(prev => prev.map(o => 
      o.id === id ? { ...o, opacity } : o
    ));
  }, []);

  const selectedOverlay = Array.isArray(overlays) 
    ? overlays.find(o => o.id === selectedOverlayId) || null 
    : null;

  return {
    overlays,
    selectedOverlay,
    selectedOverlayId,
    isLoading,
    setSelectedOverlayId,
    addOverlay,
    updateOverlayPosition,
    updateOverlaySize,
    updateOverlayConfig,
    deleteOverlay,
    bringToFront,
    sendToBack,
    updateOpacity,
  };
}
