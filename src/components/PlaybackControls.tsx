import { Speed } from '../hooks/useAnimationLoop';
import { START_YEAR, END_YEAR } from '../data/cheese-data';

interface Props {
  isPlaying: boolean;
  speed: Speed;
  currentYear: number;
  progress: number;
  onStartPause: () => void;
  onSpeedChange: (speed: Speed) => void;
  onSeek: (year: number) => void;
}

export function PlaybackControls({
  isPlaying,
  speed,
  currentYear,
  onStartPause,
  onSpeedChange,
  onSeek,
}: Props) {
  return (
    <div className="controls">
      <button onClick={onStartPause}>
        {isPlaying ? 'Pause' : 'Start'}
      </button>
      <select
        value={speed}
        onChange={(e) => onSpeedChange(e.target.value as Speed)}
      >
        <option value="Fast">Fast</option>
        <option value="Normal">Normal</option>
        <option value="Slow">Slow</option>
      </select>
      <input
        type="range"
        min={START_YEAR}
        max={END_YEAR}
        value={currentYear}
        onChange={(e) => onSeek(Number(e.target.value))}
      />
      <span className="year-label">{currentYear}</span>
    </div>
  );
}
