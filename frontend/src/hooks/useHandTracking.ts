'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { HandFeatures, Landmark } from '@/lib/types';
import { extractFeatures, landmarksToArray } from '@/lib/features';

export interface HandTrackingState {
  isModelLoaded: boolean;
  isTracking: boolean;
  loadingProgress: string;
  features: HandFeatures | null;
  allHandsLandmarks: Landmark[][] | null;
  error: string | null;
}

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const handLandmarkerRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const prevLandmarksRef = useRef<Landmark[] | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [state, setState] = useState<HandTrackingState>({
    isModelLoaded: false,
    isTracking: false,
    loadingProgress: '',
    features: null,
    allHandsLandmarks: null,
    error: null,
  });

  const loadModel = useCallback(async () => {
    if (handLandmarkerRef.current) return;

    setState((s) => ({ ...s, loadingProgress: 'Cargando modelo de mano...' }));

    try {
      const vision = await import('@mediapipe/tasks-vision');
      const { HandLandmarker, FilesetResolver } = vision;

      const wasmFileset = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
      );

      const handLandmarker = await HandLandmarker.createFromOptions(wasmFileset, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
          delegate: 'GPU',
        },
        numHands: 2,
        runningMode: 'VIDEO',
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.4,
      });

      handLandmarkerRef.current = handLandmarker;
      setState((s) => ({
        ...s,
        isModelLoaded: true,
        loadingProgress: '',
      }));
    } catch (err) {
      console.error('Failed to load hand model:', err);
      setState((s) => ({
        ...s,
        error: 'Error al cargar el modelo de detección de manos.',
        loadingProgress: '',
      }));
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!handLandmarkerRef.current || !videoRef.current) return;
    setState((s) => ({ ...s, isTracking: true }));

    const detect = () => {
      const video = videoRef.current;
      const handLandmarker = handLandmarkerRef.current;

      if (!video || !handLandmarker || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const now = performance.now();
      if (now - lastTimeRef.current < 33) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }
      lastTimeRef.current = now;

      try {
        const results = handLandmarker.detectForVideo(video, now);

        if (results.landmarks && results.landmarks.length > 0) {
          const allHands: Landmark[][] = results.landmarks.map(
            (handLms: { x: number; y: number; z: number }[]) => landmarksToArray(handLms)
          );

          const primaryIdx = 0;
          const primaryLms = allHands[primaryIdx];
          const handedness =
            results.handedness?.[primaryIdx]?.[0]?.categoryName || 'Right';

          const features = extractFeatures(
            primaryLms,
            handedness,
            prevLandmarksRef.current
          );
          prevLandmarksRef.current = primaryLms;

          setState((s) => ({ ...s, features, allHandsLandmarks: allHands }));
        } else {
          prevLandmarksRef.current = null;
          setState((s) => ({ ...s, features: null, allHandsLandmarks: null }));
        }
      } catch {
        /* frame skip */
      }

      animFrameRef.current = requestAnimationFrame(detect);
    };

    animFrameRef.current = requestAnimationFrame(detect);
  }, [videoRef]);

  const stopTracking = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    prevLandmarksRef.current = null;
    setState((s) => ({ ...s, isTracking: false, features: null, allHandsLandmarks: null }));
  }, []);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
        handLandmarkerRef.current = null;
      }
    };
  }, []);

  return { ...state, loadModel, startTracking, stopTracking };
}
