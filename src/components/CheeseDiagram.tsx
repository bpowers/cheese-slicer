import { SlicerState } from '../types';
import { ECON_SIZE, WORK_GATE_SIZE, CORNER_RADIUS, LEN, COLORS } from '../renderer/constants';

const CR = CORNER_RADIUS;

const LABEL_STYLE: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: 14,
  fontFamily: 'Arial',
};

function Label({
  x,
  y,
  fill,
  anchor = 'start',
  children,
}: {
  x: number;
  y: number;
  fill: string;
  anchor?: 'start' | 'middle' | 'end';
  children: string;
}) {
  return (
    <text
      x={x}
      y={-y}
      transform="scale(1,-1)"
      fill={fill}
      textAnchor={anchor}
      style={LABEL_STYLE}
      {...(fill === COLORS.labelLight && {
        stroke: 'rgba(0,0,0,0.3)',
        strokeWidth: 3,
        strokeLinejoin: 'round' as const,
        paintOrder: 'stroke fill',
      })}
    >
      {children}
    </text>
  );
}

function Globe() {
  return (
    <g transform="scale(1,-1)">
      <image
        href="/globe.png"
        x={-210}
        y={-210}
        width={420}
        height={420}
        opacity={0.3}
      />
    </g>
  );
}

function EconBox() {
  return (
    <>
      <rect
        x={-ECON_SIZE / 2}
        y={-ECON_SIZE / 2}
        width={ECON_SIZE}
        height={ECON_SIZE}
        fill={COLORS.economy}
      />
      <Label x={0} y={-5} fill={COLORS.labelLight} anchor="middle">
        The Economy
      </Label>
    </>
  );
}

function WorkGate() {
  const tipX = -ECON_SIZE / 2;
  const s = WORK_GATE_SIZE;

  const points = [
    `${tipX},0`,
    `${tipX - s / 4},${s / 4}`,
    `${tipX - (3 * s) / 4},${s / 4}`,
    `${tipX - s},${s / 4}`,
    `${tipX - (3 * s) / 4},0`,
    `${tipX - s},${-s / 4}`,
    `${tipX - (3 * s) / 4},${-s / 4}`,
    `${tipX - s / 4},${-s / 4}`,
  ].join(' ');

  return <polygon points={points} fill={COLORS.workGate} />;
}

function GDPBar({ state }: { state: SlicerState }) {
  const trX = ECON_SIZE / 2;
  const trY = ECON_SIZE / 2;
  const gdpSize =
    state.discretionaryCSize +
    state.staplesSize +
    state.discretionaryISize +
    state.maintenanceSize +
    state.eroiSize;

  return (
    <>
      <rect
        x={trX}
        y={trY - gdpSize}
        width={LEN / 2}
        height={gdpSize}
        fill={COLORS.gdp}
      />
      <Label x={trX + LEN / 4} y={-5} fill={COLORS.labelDark} anchor="middle">
        GDP
      </Label>
    </>
  );
}

function ConsumptionFlow({ state }: { state: SlicerState }) {
  const trX = ECON_SIZE / 2 + LEN / 2;
  const trY =
    ECON_SIZE / 2 - state.eroiSize - state.maintenanceSize - state.discretionaryISize;
  const consumptionSize = state.discretionaryCSize + state.staplesSize;
  const dCS = state.discretionaryCSize;
  const sS = state.staplesSize;

  // Staples: corner + arrow combined into single path
  const sCx = trX + LEN;
  const sCy = trY - dCS - CR;
  const sInnerR = CR - sS;
  const sArrX = sCx + CR - sS / 2;

  // Outline: outer arc from 0deg to 90deg, arrow, inner arc back
  const staplesPath = [
    `M${sCx},${sCy + CR}`,
    `A${CR} ${CR} 0 0 0 ${sCx + CR},${sCy}`,
    `L${sArrX + sS},${sCy}`,
    `L${sArrX},${sCy - sS}`,
    `L${sArrX - sS},${sCy}`,
    `L${sCx + sInnerR},${sCy}`,
    `A${sInnerR} ${sInnerR} 0 0 1 ${sCx},${sCy + sInnerR}`,
    'Z',
  ].join(' ');

  // Discretionary consumption: rect + arrow combined into single path
  const dLeft = trX + LEN;
  const dRight = trX + 3 * LEN;

  const discretionaryPath = [
    `M${dLeft},${trY}`,
    `L${dRight},${trY}`,
    `L${dRight},${trY + dCS / 2}`,
    `L${dRight + dCS},${trY - dCS / 2}`,
    `L${dRight},${trY - (3 * dCS) / 2}`,
    `L${dRight},${trY - dCS}`,
    `L${dLeft},${trY - dCS}`,
    'Z',
  ].join(' ');

  return (
    <>
      {/* Consumption bar (single rect, no seam issue) */}
      <rect
        x={trX}
        y={trY - consumptionSize}
        width={LEN}
        height={consumptionSize}
        fill={COLORS.consumption}
      />
      <Label
        x={trX + LEN / 2}
        y={trY - consumptionSize / 2 - 5}
        fill={COLORS.labelDark}
        anchor="middle"
      >
        Consumption
      </Label>

      <path d={staplesPath} fill={COLORS.staples} />
      <Label
        x={sArrX}
        y={trY - dCS - sS - CR - 10}
        fill={COLORS.labelDark}
        anchor="middle"
      >
        Staples
      </Label>

      <path d={discretionaryPath} fill={COLORS.discretionary} />
      <Label
        x={trX + 2 * LEN}
        y={trY - dCS / 2 - 5}
        fill={COLORS.labelLight}
        anchor="middle"
      >
        Discretionary
      </Label>
    </>
  );
}

function DiscretionaryInvestment({
  state,
  endX,
  num,
}: {
  state: SlicerState;
  endX: number;
  num: number;
}) {
  const dIS = state.discretionaryISize;
  const cx = endX + CR;
  const innerR = CR - dIS;
  const rectBottom = ECON_SIZE / 2 + dIS;

  // Corner (startAngle=0) connects horizontal bar above to vertical rect below.
  // Outer at 0deg: (cx, num+CR), outer at 270deg: (endX, num)
  // Inner at 270deg: (endX+dIS, num), inner at 0deg: (cx, num+innerR)
  const d = [
    `M${cx},${num + CR}`,
    `A${CR} ${CR} 0 0 1 ${endX},${num}`,
    `L${endX},${rectBottom}`,
    `L${endX - dIS / 2},${rectBottom}`,
    `L${endX + dIS / 2},${ECON_SIZE / 2}`,
    `L${endX + (3 * dIS) / 2},${rectBottom}`,
    `L${endX + dIS},${rectBottom}`,
    `L${endX + dIS},${num}`,
    `A${innerR} ${innerR} 0 0 0 ${cx},${num + innerR}`,
    'Z',
  ].join(' ');

  return (
    <>
      <path d={d} fill={COLORS.discretionary} />
      <Label
        x={endX + (3 * dIS) / 2 - 4}
        y={ECON_SIZE / 2 + dIS + 4}
        fill={COLORS.labelDark}
      >
        Discretionary
      </Label>
    </>
  );
}

function MaintenanceFlow({
  state,
  startY,
  endX,
  num,
}: {
  state: SlicerState;
  startY: number;
  endX: number;
  num: number;
}) {
  const mS = state.maintenanceSize;
  const mEndX = -ECON_SIZE / 2 + ECON_SIZE / 3;
  const cx = mEndX + CR - mS / 2;
  const cy = num + mS;
  const innerR = CR - mS;

  const hRight = endX + CR;
  const hTop = startY - state.eroiSize;
  const hBottom = hTop - mS;

  const vLeft = mEndX - mS / 2;
  const vRight = mEndX + mS / 2;
  const vBottom = ECON_SIZE / 2 + mS;

  // Outline: horizontal bar right → corner outer → vertical bar down → arrow → back up
  const d = [
    `M${hRight},${hTop}`,
    `L${cx},${hTop}`,
    `A${CR} ${CR} 0 0 1 ${vLeft},${cy}`,
    `L${vLeft},${vBottom}`,
    `L${mEndX - mS},${vBottom}`,
    `L${mEndX},${ECON_SIZE / 2}`,
    `L${mEndX + mS},${vBottom}`,
    `L${vRight},${vBottom}`,
    `L${vRight},${cy}`,
    `A${innerR} ${innerR} 0 0 0 ${cx},${hBottom}`,
    `L${hRight},${hBottom}`,
    'Z',
  ].join(' ');

  return (
    <>
      <path d={d} fill={COLORS.maintenance} />
      <Label
        x={hRight - 5}
        y={startY - state.eroiSize - mS / 2 - 5}
        fill={COLORS.labelLight}
        anchor="end"
      >
        Maintenance
      </Label>
    </>
  );
}

function EnergyAcquisition({
  state,
  startY,
  endX,
  num,
}: {
  state: SlicerState;
  startY: number;
  endX: number;
  num: number;
}) {
  const eS = state.eroiSize;
  const eroiEndX = -ECON_SIZE / 2 - WORK_GATE_SIZE / 2;
  const eroiEndY = WORK_GATE_SIZE / 4;
  const cx = eroiEndX + CR - eS / 2;
  const cy = num + state.maintenanceSize + eS;
  const innerR = CR - eS;

  const hRight = endX + CR;
  const hBottom = startY - eS;

  const vLeft = eroiEndX - eS / 2;
  const vRight = eroiEndX + eS / 2;
  const vBottom = eroiEndY + eS;

  const d = [
    `M${hRight},${startY}`,
    `L${cx},${startY}`,
    `A${CR} ${CR} 0 0 1 ${vLeft},${cy}`,
    `L${vLeft},${vBottom}`,
    `L${eroiEndX - eS},${vBottom}`,
    `L${eroiEndX},${eroiEndY}`,
    `L${eroiEndX + eS},${vBottom}`,
    `L${vRight},${vBottom}`,
    `L${vRight},${cy}`,
    `A${innerR} ${innerR} 0 0 0 ${cx},${hBottom}`,
    `L${hRight},${hBottom}`,
    'Z',
  ].join(' ');

  return (
    <>
      <path d={d} fill={COLORS.energyAcquisition} />
      <Label
        x={cx - 12}
        y={startY - eS / 2 - 5}
        fill={COLORS.labelLight}
      >
        Energy Acquisition
      </Label>
    </>
  );
}

function InvestmentFlow({ state }: { state: SlicerState }) {
  const trX = ECON_SIZE / 2 + 2 * LEN;
  const trY =
    ECON_SIZE / 2 - state.eroiSize - state.maintenanceSize - state.discretionaryISize + CR / 2;
  const investmentSize = state.discretionaryISize + state.eroiSize + state.maintenanceSize;
  const innerR = CR - investmentSize;

  const startY = ECON_SIZE / 2 + LEN + 2 * CR - investmentSize;
  const endX = (2 * ECON_SIZE) / 5;
  const num = trY + CR / 2 + LEN - state.eroiSize - state.maintenanceSize;

  const hBarLeft = trX - (3 * LEN) / 2;
  const hBarBottom = ECON_SIZE / 2 - investmentSize;
  const hBarTop = ECON_SIZE / 2;
  const corner1cy = trY + CR / 2;
  const corner2cy = corner1cy + LEN;
  const vBarRight = trX + CR;
  const vBarLeft = vBarRight - investmentSize;
  const topBarLeft = endX + CR;
  const topBarBottom = startY - investmentSize;

  // U-shaped path: horizontal bar → corner1 → vertical bar → corner2 → top bar
  const d = [
    `M${hBarLeft},${hBarBottom}`,
    `L${trX},${hBarBottom}`,
    `A${CR} ${CR} 0 0 1 ${vBarRight},${corner1cy}`,
    `L${vBarRight},${corner2cy}`,
    `A${CR} ${CR} 0 0 1 ${trX},${startY}`,
    `L${topBarLeft},${startY}`,
    `L${topBarLeft},${topBarBottom}`,
    `L${trX},${topBarBottom}`,
    `A${innerR} ${innerR} 0 0 0 ${vBarLeft},${corner2cy}`,
    `L${vBarLeft},${corner1cy}`,
    `A${innerR} ${innerR} 0 0 0 ${trX},${hBarTop}`,
    `L${hBarLeft},${hBarTop}`,
    'Z',
  ].join(' ');

  return (
    <>
      <path d={d} fill={COLORS.investment} />

      <Label
        x={trX}
        y={ECON_SIZE / 2 - investmentSize / 2 - 5}
        fill={COLORS.labelLight}
        anchor="end"
      >
        Investment
      </Label>

      <DiscretionaryInvestment state={state} endX={endX} num={num} />
      <MaintenanceFlow state={state} startY={startY} endX={endX} num={num} />
      <EnergyAcquisition state={state} startY={startY} endX={endX} num={num} />
    </>
  );
}

function EnergyFrame({ state }: { state: SlicerState }) {
  const endEnergyX = -200;
  const eS = state.energySize;
  const innerR = CR - eS;
  const arrowTipX = -ECON_SIZE / 2 - (3 * WORK_GATE_SIZE) / 4 - 5;
  const arrowBaseX = arrowTipX - eS;

  // Corner centers
  const cx1 = -CR + eS / 2;        // bottom-right corner
  const cx23 = endEnergyX;          // bottom-left and top-left corners share x
  const cy12 = -210;                // aligned with globe bottom edge
  const cy3 = -CR + eS / 2;        // top-left corner

  // U-shape (open top-right): 3 corners, 3 straight segments, arrow
  const d = [
    // Outer edge, clockwise from open end
    `M${cx1 + CR},${cy12}`,
    `A${CR} ${CR} 0 0 0 ${cx1},${cy12 - CR}`,
    `L${cx23},${cy12 - CR}`,
    `A${CR} ${CR} 0 0 0 ${cx23 - CR},${cy12}`,
    `L${cx23 - CR},${cy3}`,
    `A${CR} ${CR} 0 0 0 ${cx23},${cy3 + CR}`,
    // Top bar to arrow
    `L${arrowBaseX},${eS / 2}`,
    `L${arrowBaseX},${eS}`,
    `L${arrowTipX},0`,
    `L${arrowBaseX},${-eS}`,
    `L${arrowBaseX},${-eS / 2}`,
    // Inner edge, back toward open end
    `L${cx23},${cy3 + innerR}`,
    `A${innerR} ${innerR} 0 0 1 ${cx23 - innerR},${cy3}`,
    `L${cx23 - innerR},${cy12}`,
    `A${innerR} ${innerR} 0 0 1 ${cx23},${cy12 - innerR}`,
    `L${cx1},${cy12 - innerR}`,
    `A${innerR} ${innerR} 0 0 1 ${cx1 + innerR},${cy12}`,
    'Z',
  ].join(' ');

  return (
    <>
      <path d={d} fill={COLORS.energy} />
      <Label
        x={endEnergyX + eS}
        y={cy12 - CR + eS / 2 - 5}
        fill={COLORS.labelLight}
      >
        Energy
      </Label>
    </>
  );
}

export function CheeseDiagram({ state }: { state: SlicerState }) {
  return (
    <svg
      viewBox="-350 -350 700 700"
      preserveAspectRatio="xMidYMid meet"
      overflow="visible"
      style={{ width: '100%', height: '100%' }}
    >
      <g transform="scale(1,-1)">
        <Globe />
        <EconBox />
        <WorkGate />
        <GDPBar state={state} />
        <ConsumptionFlow state={state} />
        <InvestmentFlow state={state} />
        <EnergyFrame state={state} />
      </g>
    </svg>
  );
}
