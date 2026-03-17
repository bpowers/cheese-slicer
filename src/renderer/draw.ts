import { SlicerState } from '../types';
import { CORNER_RADIUS } from './constants';
import { drawEconBox, drawWorkGate, drawGDP, drawTotalConsumption, drawTotalInvestment, drawEnergy } from './shapes';

export function renderScene(
  ctx: CanvasRenderingContext2D,
  state: SlicerState,
  globeImage: HTMLImageElement | null,
  width: number,
  height: number,
): void {
  ctx.save();

  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);

  // set up coordinate system: origin at center, Y up, scaled to fit
  ctx.translate(width / 2, height / 2);
  const scale = Math.min(width, height) / 700;
  ctx.scale(scale, -scale);

  // draw globe background, sized to the diagram
  // bottom of energy pipe is at y = -200 - CORNER_RADIUS = -280
  if (globeImage && globeImage.complete) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    const globeSize = 420;
    ctx.scale(1, -1);
    ctx.drawImage(
      globeImage,
      -globeSize / 2,
      -globeSize / 2,
      globeSize,
      globeSize,
    );
    ctx.restore();
  }

  drawEconBox(ctx);
  drawWorkGate(ctx);
  drawGDP(ctx, state);
  drawTotalConsumption(ctx, state);
  drawTotalInvestment(ctx, state);
  drawEnergy(ctx, state);

  ctx.restore();
}
