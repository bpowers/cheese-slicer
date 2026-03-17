import { SlicerState } from '../types';
import { ECON_SIZE, WORK_GATE_SIZE, CORNER_RADIUS, LEN, COLORS } from './constants';
import { drawCorner } from './corners';
import { drawText, textExtent } from './text';

export function drawEconBox(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = COLORS.economy;
  ctx.fillRect(-ECON_SIZE / 2, -ECON_SIZE / 2, ECON_SIZE, ECON_SIZE);

  const label = 'The Economy';
  const tw = textExtent(ctx, label);
  drawText(ctx, -tw / 2, -5, label, COLORS.labelLight);
}

export function drawWorkGate(ctx: CanvasRenderingContext2D): void {
  const tipX = -ECON_SIZE / 2;
  const s = WORK_GATE_SIZE;

  ctx.fillStyle = COLORS.workGate;
  ctx.beginPath();
  // right arrow point
  ctx.moveTo(tipX, 0);
  ctx.lineTo(tipX - s / 4, s / 4);
  // top edge
  ctx.lineTo(tipX - (3 * s) / 4, s / 4);
  // left indent (matching right arrow shape)
  ctx.lineTo(tipX - s, s / 4);
  ctx.lineTo(tipX - (3 * s) / 4, 0);
  ctx.lineTo(tipX - s, -s / 4);
  // bottom edge
  ctx.lineTo(tipX - (3 * s) / 4, -s / 4);
  ctx.lineTo(tipX - s / 4, -s / 4);
  ctx.closePath();
  ctx.fill();
}

export function drawGDP(ctx: CanvasRenderingContext2D, state: SlicerState): void {
  const trX = ECON_SIZE / 2;
  const trY = ECON_SIZE / 2;
  const gdpSize =
    state.discretionaryCSize +
    state.staplesSize +
    state.discretionaryISize +
    state.maintenanceSize +
    state.eroiSize;

  ctx.fillStyle = COLORS.gdp;
  ctx.fillRect(trX, trY - gdpSize, LEN / 2, gdpSize);

  const label = 'GDP';
  const tw = textExtent(ctx, label);
  drawText(ctx, trX + LEN / 4 - tw / 2, -5, label, COLORS.labelDark);
}

export function drawTotalConsumption(ctx: CanvasRenderingContext2D, state: SlicerState): void {
  const trX = ECON_SIZE / 2 + LEN / 2;
  const trY =
    ECON_SIZE / 2 - state.eroiSize - state.maintenanceSize - state.discretionaryISize;
  const consumptionSize = state.discretionaryCSize + state.staplesSize;

  ctx.fillStyle = COLORS.consumption;
  ctx.fillRect(trX, trY - consumptionSize, LEN, consumptionSize);

  const label = 'Consumption';
  const tw = textExtent(ctx, label);
  drawText(ctx, trX + LEN / 2 - tw / 2, trY - consumptionSize / 2 - 5, label, COLORS.labelDark);

  // goldenrod staples corner + arrow
  ctx.fillStyle = COLORS.staples;
  drawCorner(ctx, trX + LEN, trY - state.discretionaryCSize - CORNER_RADIUS, 90, state.staplesSize);

  ctx.beginPath();
  const sArrX = trX + LEN + CORNER_RADIUS - state.staplesSize / 2;
  const sArrY = trY - state.discretionaryCSize - CORNER_RADIUS;
  ctx.moveTo(sArrX, sArrY - state.staplesSize);
  ctx.lineTo(sArrX + state.staplesSize, sArrY);
  ctx.lineTo(sArrX - state.staplesSize, sArrY);
  ctx.closePath();
  ctx.fill();

  const sLabel = 'Staples';
  const stw = textExtent(ctx, sLabel);
  drawText(
    ctx,
    sArrX - stw / 2,
    trY - state.discretionaryCSize - state.staplesSize - CORNER_RADIUS - 10,
    sLabel,
    COLORS.labelDark,
  );

  // red discretionary consumption bar + arrow
  ctx.fillStyle = COLORS.discretionary;
  ctx.fillRect(trX + LEN, trY - state.discretionaryCSize, 2 * LEN, state.discretionaryCSize);

  ctx.beginPath();
  ctx.moveTo(trX + 3 * LEN + state.discretionaryCSize, trY - state.discretionaryCSize / 2);
  ctx.lineTo(trX + 3 * LEN, trY + state.discretionaryCSize / 2);
  ctx.lineTo(trX + 3 * LEN, trY - (3 * state.discretionaryCSize) / 2);
  ctx.closePath();
  ctx.fill();

  const dLabel = 'Discretionary';
  const dtw = textExtent(ctx, dLabel);
  drawText(ctx, trX + 2 * LEN - dtw / 2, trY - state.discretionaryCSize / 2 - 5, dLabel, COLORS.labelDark);
}

export function drawTotalInvestment(ctx: CanvasRenderingContext2D, state: SlicerState): void {
  const CR = CORNER_RADIUS;
  const trX = ECON_SIZE / 2 + 2 * LEN;
  const trY = ECON_SIZE / 2 - state.eroiSize - state.maintenanceSize - state.discretionaryISize + CR / 2;
  const investmentSize = state.discretionaryISize + state.eroiSize + state.maintenanceSize;

  // magenta investment bar (vertical, continuing from GDP)
  ctx.fillStyle = COLORS.investment;
  ctx.fillRect(trX - (3 * LEN) / 2, ECON_SIZE / 2 - investmentSize, (3 * LEN) / 2, investmentSize);

  // corner going up-right
  drawCorner(ctx, trX, trY + CR / 2, 180, investmentSize);

  // vertical bar going up along right side
  ctx.fillRect(trX + CR - investmentSize, trY + CR / 2, investmentSize, LEN);

  // corner at top turning left
  drawCorner(ctx, trX, trY + CR / 2 + LEN, 90, investmentSize);

  // horizontal bar going left across the top
  const startY = ECON_SIZE / 2 + LEN + 2 * CR - investmentSize;
  const endX = -ECON_SIZE / 2 + (3 * ECON_SIZE) / 5;
  ctx.fillRect(endX + CR, startY - investmentSize, trX - (endX + CR), investmentSize);

  // the Y where corners turn downward for sub-flows
  const num = trY + CR / 2 + LEN - state.eroiSize - state.maintenanceSize;

  // sub-flows
  drawDiscretionaryInvestment(ctx, state, endX, num);
  drawMaintenance(ctx, state, startY, endX, num);
  drawEnergyAcquisition(ctx, state, startY, endX, num);

  // "Investment" label
  const label = 'Investment';
  const tw = textExtent(ctx, label);
  drawText(ctx, trX - tw, ECON_SIZE / 2 - investmentSize / 2 - 5, label, COLORS.labelDark);
}

function drawDiscretionaryInvestment(
  ctx: CanvasRenderingContext2D,
  state: SlicerState,
  endX: number,
  num: number,
): void {
  ctx.fillStyle = COLORS.discretionary;

  // corner turning downward
  drawCorner(ctx, endX + CORNER_RADIUS, num, 0, state.discretionaryISize);

  // vertical bar down to economy box
  ctx.fillRect(endX, ECON_SIZE / 2 + state.discretionaryISize, state.discretionaryISize, num - (ECON_SIZE / 2 + state.discretionaryISize));

  // arrow pointing down into economy
  ctx.beginPath();
  ctx.moveTo(endX + state.discretionaryISize / 2, ECON_SIZE / 2);
  ctx.lineTo(endX + (3 * state.discretionaryISize) / 2, ECON_SIZE / 2 + state.discretionaryISize);
  ctx.lineTo(endX - state.discretionaryISize / 2, ECON_SIZE / 2 + state.discretionaryISize);
  ctx.closePath();
  ctx.fill();

  drawText(
    ctx,
    endX + (3 * state.discretionaryISize) / 2 - 4,
    ECON_SIZE / 2 + state.discretionaryISize + 4,
    'Discretionary',
    COLORS.labelDark,
  );
}

function drawMaintenance(
  ctx: CanvasRenderingContext2D,
  state: SlicerState,
  startY: number,
  endX: number,
  num: number,
): void {
  const mEndX = -ECON_SIZE / 2 + ECON_SIZE / 3;

  ctx.fillStyle = COLORS.maintenance;

  // horizontal bar (left edge aligns with corner center to avoid overlap)
  const mCornerX = mEndX + CORNER_RADIUS - state.maintenanceSize / 2;
  ctx.fillRect(
    mCornerX,
    startY - state.eroiSize - state.maintenanceSize,
    endX + CORNER_RADIUS - mCornerX,
    state.maintenanceSize,
  );

  // corner turning downward
  drawCorner(ctx, mEndX + CORNER_RADIUS - state.maintenanceSize / 2, num + state.maintenanceSize, 0, state.maintenanceSize);

  // vertical bar down to economy box
  ctx.fillRect(
    mEndX - state.maintenanceSize / 2,
    ECON_SIZE / 2 + state.maintenanceSize,
    state.maintenanceSize,
    num + state.maintenanceSize - (ECON_SIZE / 2 + state.maintenanceSize),
  );

  // arrow pointing down into economy
  ctx.beginPath();
  ctx.moveTo(mEndX, ECON_SIZE / 2);
  ctx.lineTo(mEndX + state.maintenanceSize, ECON_SIZE / 2 + state.maintenanceSize);
  ctx.lineTo(mEndX - state.maintenanceSize, ECON_SIZE / 2 + state.maintenanceSize);
  ctx.closePath();
  ctx.fill();

  const label = 'Maintenance';
  const tw = textExtent(ctx, label);
  drawText(
    ctx,
    endX + CORNER_RADIUS - tw - 5,
    startY - state.eroiSize - state.maintenanceSize / 2 - 5,
    label,
    COLORS.labelDark,
  );
}

function drawEnergyAcquisition(
  ctx: CanvasRenderingContext2D,
  state: SlicerState,
  startY: number,
  endX: number,
  num: number,
): void {
  const eroiEndX = -ECON_SIZE / 2 - WORK_GATE_SIZE / 2;
  const eroiEndY = WORK_GATE_SIZE / 4;

  ctx.fillStyle = COLORS.energyAcquisition;

  // horizontal bar
  ctx.fillRect(
    eroiEndX + CORNER_RADIUS - state.eroiSize / 2,
    startY - state.eroiSize,
    endX + CORNER_RADIUS - (eroiEndX + CORNER_RADIUS - state.eroiSize / 2),
    state.eroiSize,
  );

  // corner turning downward
  drawCorner(
    ctx,
    eroiEndX + CORNER_RADIUS - state.eroiSize / 2,
    num + state.maintenanceSize + state.eroiSize,
    0,
    state.eroiSize,
  );

  // vertical bar down toward work gate
  ctx.fillRect(
    eroiEndX - state.eroiSize / 2,
    eroiEndY + state.eroiSize,
    state.eroiSize,
    num + state.maintenanceSize + state.eroiSize - (eroiEndY + state.eroiSize),
  );

  // arrow pointing down
  ctx.beginPath();
  ctx.moveTo(eroiEndX, eroiEndY);
  ctx.lineTo(eroiEndX + state.eroiSize, eroiEndY + state.eroiSize);
  ctx.lineTo(eroiEndX - state.eroiSize, eroiEndY + state.eroiSize);
  ctx.closePath();
  ctx.fill();

  drawText(
    ctx,
    eroiEndX + CORNER_RADIUS - state.eroiSize / 2 - 12,
    startY - state.eroiSize / 2 - 5,
    'Energy Acquisition',
    COLORS.labelDark,
  );
}

export function drawEnergy(ctx: CanvasRenderingContext2D, state: SlicerState): void {
  const endEnergyX = -200;
  const energySize = state.energySize;

  ctx.fillStyle = COLORS.energy;

  // bottom-right corner (from right side going down-left)
  drawCorner(ctx, -CORNER_RADIUS + energySize / 2, -200, 180, energySize);

  // horizontal bar going left along bottom
  ctx.fillRect(endEnergyX, -200 - CORNER_RADIUS, -CORNER_RADIUS + energySize / 2 - endEnergyX, energySize);

  // bottom-left corner
  drawCorner(ctx, endEnergyX, -200, 270, energySize);

  // vertical bar going up
  ctx.fillRect(endEnergyX - CORNER_RADIUS, -CORNER_RADIUS + energySize / 2, energySize, -200 - (-CORNER_RADIUS + energySize / 2));

  // top-left corner
  drawCorner(ctx, endEnergyX, -CORNER_RADIUS + energySize / 2, 0, energySize);

  // arrow pointing right into work gate
  ctx.beginPath();
  ctx.moveTo(endEnergyX + energySize, 0);
  ctx.lineTo(endEnergyX, energySize);
  ctx.lineTo(endEnergyX, -energySize);
  ctx.closePath();
  ctx.fill();

  drawText(ctx, endEnergyX + energySize, -200 - CORNER_RADIUS + energySize / 2 - 5, 'Energy', COLORS.labelLight);
}
