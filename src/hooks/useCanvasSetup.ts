import { useRef, useState, useEffect, useCallback } from 'react';

export function useCanvasSetup() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });

  const updateSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    setSize({ width, height });
  }, []);

  useEffect(() => {
    updateSize();

    const observer = new ResizeObserver(updateSize);
    const parent = canvasRef.current?.parentElement;
    if (parent) {
      observer.observe(parent);
    }

    return () => observer.disconnect();
  }, [updateSize]);

  return { canvasRef, width: size.width, height: size.height };
}
