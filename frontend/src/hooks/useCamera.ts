'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export interface CameraState {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>({
    isActive: false,
    isLoading: false,
    error: null,
  });

  const attachStream = useCallback(() => {
    if (videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const start = useCallback(async () => {
    if (streamRef.current) {
      attachStream();
      return;
    }
    setState({ isActive: false, isLoading: true, error: null });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, min: 15 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState({ isActive: true, isLoading: false, error: null });
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado. Habilita el acceso en la configuración del navegador.'
          : 'No se pudo acceder a la cámara. Verifica que esté conectada.';
      setState({ isActive: false, isLoading: false, error: message });
    }
  }, [attachStream]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState({ isActive: false, isLoading: false, error: null });
  }, []);

  useEffect(() => {
    if (streamRef.current && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  });

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return { videoRef, state, start, stop };
}
