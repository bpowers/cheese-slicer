import { useState, useRef, useCallback } from 'react';
import { SlicerState } from '../types';
import { ECON_SIZE } from '../renderer/constants';
import * as data from '../data/cheese-data';

const TOTAL_STEPS = 5;

function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

function computeState(yearIndex: number, subStep: number): SlicerState {
  const t = subStep / TOTAL_STEPS;

  const prevIdx = Math.max(0, yearIndex - 1);
  const curIdx = yearIndex;

  const total0 =
    data.consumption[prevIdx] +
    data.investment[prevIdx] +
    data.eroi[prevIdx] +
    data.metabolism[prevIdx] +
    data.fsc[prevIdx];

  const total1 =
    data.consumption[curIdx] +
    data.investment[curIdx] +
    data.eroi[curIdx] +
    data.metabolism[curIdx] +
    data.fsc[curIdx];

  return {
    discretionaryCSize: ECON_SIZE * lerp(data.consumption[prevIdx] / total0, data.consumption[curIdx] / total1, t),
    staplesSize: ECON_SIZE * lerp(data.fsc[prevIdx] / total0, data.fsc[curIdx] / total1, t),
    discretionaryISize: ECON_SIZE * lerp(data.investment[prevIdx] / total0, data.investment[curIdx] / total1, t),
    maintenanceSize: ECON_SIZE * lerp(data.metabolism[prevIdx] / total0, data.metabolism[curIdx] / total1, t),
    eroiSize: ECON_SIZE * lerp(data.eroi[prevIdx] / total0, data.eroi[curIdx] / total1, t),
    energySize: ECON_SIZE * lerp(
      data.energy[prevIdx] / data.ENERGY_MAX,
      data.energy[curIdx] / data.ENERGY_MAX,
      t,
    ),
  };
}

export type Speed = 'Fast' | 'Normal' | 'Slow';

const SPEED_MS: Record<Speed, number> = {
  Fast: 33,
  Normal: 100,
  Slow: 200,
};

export interface AnimationState {
  state: SlicerState;
  currentYear: number;
  progress: number;
  isPlaying: boolean;
  speed: Speed;
  start: () => void;
  pause: () => void;
  setSpeed: (s: Speed) => void;
}

export function useAnimationLoop(): AnimationState {
  const totalYears = data.END_YEAR - data.START_YEAR;

  const [yearIndex, setYearIndex] = useState(0);
  const [subStep, setSubStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>('Normal');

  const yearRef = useRef(0);
  const subStepRef = useRef(0);
  const playingRef = useRef(false);
  const speedRef = useRef<Speed>('Normal');
  const lastTickRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const tick = useCallback((timestamp: number) => {
    if (!playingRef.current) return;

    const interval = SPEED_MS[speedRef.current];
    if (timestamp - lastTickRef.current >= interval) {
      lastTickRef.current = timestamp;

      let nextSub = subStepRef.current + 1;
      let nextYear = yearRef.current;

      if (nextSub >= TOTAL_STEPS) {
        nextSub = 0;
        nextYear++;
      }

      if (nextYear > totalYears) {
        playingRef.current = false;
        setIsPlaying(false);
        yearRef.current = 0;
        subStepRef.current = 0;
        setYearIndex(0);
        setSubStep(0);
        return;
      }

      yearRef.current = nextYear;
      subStepRef.current = nextSub;
      setYearIndex(nextYear);
      setSubStep(nextSub);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [totalYears]);

  const start = useCallback(() => {
    if (playingRef.current) return;
    playingRef.current = true;
    setIsPlaying(true);
    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const pause = useCallback(() => {
    playingRef.current = false;
    setIsPlaying(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const setSpeedCb = useCallback((s: Speed) => {
    speedRef.current = s;
    setSpeed(s);
  }, []);

  const slicerState = computeState(yearIndex, subStep);
  const currentYear = data.START_YEAR + yearIndex;
  const progress = yearIndex / totalYears;

  return {
    state: slicerState,
    currentYear,
    progress,
    isPlaying,
    speed,
    start,
    pause,
    setSpeed: setSpeedCb,
  };
}
