import { useEffect, useRef } from 'react';
import './App.css';
import { useCanvasSetup } from './hooks/useCanvasSetup';
import { useAnimationLoop } from './hooks/useAnimationLoop';
import { PlaybackControls } from './components/PlaybackControls';
import { renderScene } from './renderer/draw';

export function App() {
  const { canvasRef, width, height } = useCanvasSetup();
  const animation = useAnimationLoop();
  const globeRef = useRef<HTMLImageElement | null>(null);
  const globeLoadedRef = useRef(false);

  useEffect(() => {
    const img = new Image();
    img.src = new URL('../public/globe.png', import.meta.url).href;
    img.onload = () => {
      globeRef.current = img;
      globeLoadedRef.current = true;
    };
    globeRef.current = img;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderScene(ctx, animation.state, globeRef.current, width, height);
    ctx.restore();
  }, [canvasRef, width, height, animation.state]);

  const handleStartPause = () => {
    if (animation.isPlaying) {
      animation.pause();
    } else {
      animation.start();
    }
  };

  return (
    <div className="app">
      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>
      <PlaybackControls
        isPlaying={animation.isPlaying}
        speed={animation.speed}
        currentYear={animation.currentYear}
        progress={animation.progress}
        onStartPause={handleStartPause}
        onSpeedChange={animation.setSpeed}
        onSeek={animation.seek}
      />
    </div>
  );
}
