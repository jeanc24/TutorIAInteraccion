'use client';

import { useEffect, useRef, useCallback } from 'react';
import { HandFeatures } from '@/lib/types';

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  features: HandFeatures | null;
  allHandsLandmarks?: [number, number, number][][] | null;
  showLandmarks: boolean;
  className?: string;
}

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

const HAND_COLORS = [
  { line: 'rgba(79, 70, 229, 0.6)', dot: '#4F46E5', dotLight: '#818CF8' },
  { line: 'rgba(5, 150, 105, 0.6)', dot: '#059669', dotLight: '#34D399' },
];

export default function CameraFeed({ videoRef, features, allHandsLandmarks, showLandmarks, className = '' }: CameraFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
  }, []);

  useEffect(() => {
    syncCanvasSize();
    const observer = new ResizeObserver(syncCanvasSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [syncCanvasSize]);

  useEffect(() => {
    if (!showLandmarks || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const handsToDraw = allHandsLandmarks ?? (features ? [features.landmarks] : []);
    if (handsToDraw.length === 0) return;

    for (let handIdx = 0; handIdx < handsToDraw.length; handIdx++) {
      const lms = handsToDraw[handIdx];
      if (!lms || lms.length < 21) continue;

      const colors = HAND_COLORS[handIdx % HAND_COLORS.length];

      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 2;
      for (const [a, b] of CONNECTIONS) {
        const ax = (1 - lms[a][0]) * w;
        const ay = lms[a][1] * h;
        const bx = (1 - lms[b][0]) * w;
        const by = lms[b][1] * h;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      for (let i = 0; i < lms.length; i++) {
        const x = (1 - lms[i][0]) * w;
        const y = lms[i][1] * h;
        const isTip = [4, 8, 12, 16, 20].includes(i);
        const radius = isTip ? 5 : 3;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = isTip ? colors.dot : colors.dotLight;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }, [features, allHandsLandmarks, showLandmarks]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden rounded-xl bg-black ${className}`}>
      <video
        ref={videoRef as React.RefObject<HTMLVideoElement>}
        className="w-full h-full object-cover camera-mirror"
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      {!features && !allHandsLandmarks?.length && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-2 sm:inset-4 border-2 border-dashed border-white/20 rounded-xl" />
          <span className="text-white/60 text-xs sm:text-sm font-medium bg-black/30 px-3 py-1.5 rounded-full">
            Coloca tu mano aquí
          </span>
        </div>
      )}
    </div>
  );
}
