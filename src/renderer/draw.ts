import { SlicerState } from '../types';
import { drawEconBox, drawWorkGate, drawGDP, drawTotalConsumption, drawTotalInvestment, drawEnergy } from './shapes';

export function renderScene(
  ctx: CanvasRenderingContext2D,
  state: SlicerState,
  globeImage: HTMLImageElement | null,
  width: number,
  height: number,
): void {
  ctx.save();

  ctx.clearRect(0, 0, width, height);

  // draw globe background at reduced opacity
  if (globeImage) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    const imgSize = Math.min(width, height);
    ctx.drawImage(
      globeImage,
      (width - imgSize) / 2,
      (height - imgSize) / 2,
      imgSize,
      imgSize,
    );
    ctx.restore();
  }

  // set up coordinate system: origin at center, Y up, scaled to fit
  ctx.translate(width / 2, height / 2);
  const scale = Math.min(width, height) / 700;
  ctx.scale(scale, -scale);

  drawEconBox(ctx);
  drawWorkGate(ctx);
  drawGDP(ctx, state);
  drawTotalConsumption(ctx, state);
  drawTotalInvestment(ctx, state);
  drawEnergy(ctx, state);

  ctx.restore();
}
