import { LABEL_FONT } from './constants';

export function textExtent(ctx: CanvasRenderingContext2D, text: string): number {
  ctx.font = LABEL_FONT;
  return ctx.measureText(text).width;
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  color: string,
): void {
  ctx.save();
  ctx.font = LABEL_FONT;
  ctx.fillStyle = color;
  // Canvas text renders top-down; in our Y-flipped coordinate system,
  // we need to un-flip for text rendering
  ctx.scale(1, -1);
  ctx.fillText(text, x, -y);
  ctx.restore();
}
