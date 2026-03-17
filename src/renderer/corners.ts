import { CORNER_RADIUS, FINENESS } from './constants';

export function drawCorner(
  ctx: CanvasRenderingContext2D,
  xPosition: number,
  yPosition: number,
  startAngleDeg: number,
  lineWidth: number,
): void {
  const ourAngle = ((90.0 / FINENESS) * Math.PI) / 180.0;
  const ourStartAngle = (startAngleDeg * Math.PI) / 180.0;

  ctx.beginPath();

  for (let i = 0; i <= FINENESS; i++) {
    const innerR = CORNER_RADIUS - lineWidth;
    const angle = ourStartAngle - ourAngle * i;

    const innerX = xPosition + Math.sin(angle) * innerR;
    const innerY = yPosition + Math.cos(angle) * innerR;

    if (i === 0) {
      ctx.moveTo(innerX, innerY);
    } else {
      ctx.lineTo(innerX, innerY);
    }
  }

  for (let i = FINENESS; i >= 0; i--) {
    const angle = ourStartAngle - ourAngle * i;

    const outerX = xPosition + Math.sin(angle) * CORNER_RADIUS;
    const outerY = yPosition + Math.cos(angle) * CORNER_RADIUS;
    ctx.lineTo(outerX, outerY);
  }

  ctx.closePath();
  ctx.fill();
}
