import './App.css';
import { useAnimationLoop } from './hooks/useAnimationLoop';
import { PlaybackControls } from './components/PlaybackControls';
import { CheeseDiagram } from './components/CheeseDiagram';

export function App() {
  const animation = useAnimationLoop();

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
        <CheeseDiagram state={animation.state} />
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
