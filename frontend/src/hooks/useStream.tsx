import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

interface StreamStatus {
  is_running: boolean;
  rtsp_url: string | null;
  hls_url: string | null;
}

export function useStream() {
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    is_running: false,
    rtsp_url: null,
    hls_url: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch stream status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE.replace('/api', '')}/api/stream/status`);
      if (response.ok) {
        const data = await response.json();
        setStreamStatus(data);
      }
    } catch (error) {
      console.log('Could not fetch stream status');
    }
  }, []);

  // Start stream
  const startStream = useCallback(async (rtspUrl: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE.replace('/api', '')}/api/stream/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rtsp_url: rtspUrl }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        toast.success('Stream started successfully!');
        await fetchStatus();
        return { success: true, hls_url: data.hls_url };
      } else {
        toast.error(data.message || 'Failed to start stream');
        return { success: false, error: data.message };
      }
    } catch (error) {
      toast.error('Could not connect to backend');
      return { success: false, error: 'Connection failed' };
    } finally {
      setIsLoading(false);
    }
  }, [fetchStatus]);

  // Stop stream
  const stopStream = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE.replace('/api', '')}/api/stream/stop`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Stream stopped');
        await fetchStatus();
        return { success: true };
      } else {
        toast.error(data.message || 'Failed to stop stream');
        return { success: false };
      }
    } catch (error) {
      toast.error('Could not connect to backend');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [fetchStatus]);

  // Restart stream
  const restartStream = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE.replace('/api', '')}/api/stream/restart`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        toast.success('Stream restarted');
        await fetchStatus();
        return { success: true };
      } else {
        toast.error(data.message || 'Failed to restart stream');
        return { success: false };
      }
    } catch (error) {
      toast.error('Could not connect to backend');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [fetchStatus]);

  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
    // Poll status every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    streamStatus,
    isLoading,
    startStream,
    stopStream,
    restartStream,
    refreshStatus: fetchStatus,
  };
}
