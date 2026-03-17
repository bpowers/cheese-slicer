import { Speed } from '../hooks/useAnimationLoop';
import { START_YEAR, END_YEAR } from '../data/cheese-data';

interface Props {
  isPlaying: boolean;
  speed: Speed;
  currentYear: number;
  progress: number;
  onStartPause: () => void;
  onSpeedChange: (speed: Speed) => void;
}

export function PlaybackControls({
  isPlaying,
  speed,
  currentYear,
  progress,
  onStartPause,
  onSpeedChange,
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
        readOnly
      />
      <span className="year-label">{currentYear}</span>
    </div>
  );
}
