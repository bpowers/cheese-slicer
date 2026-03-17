import { SlicerState } from '../types';
import { ECON_SIZE, WORK_GATE_SIZE, CORNER_RADIUS, LEN, FINENESS, COLORS } from '../renderer/constants';

const LABEL_STYLE: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: 14,
  fontFamily: 'Arial',
};

function cornerPath(
  cx: number,
  cy: number,
  startAngleDeg: number,
  lineWidth: number,
): string {
  const innerR = CORNER_RADIUS - lineWidth;
  const outerR = CORNER_RADIUS;
  const stepAngle = ((90 / FINENESS) * Math.PI) / 180;
  const startAngle = (startAngleDeg * Math.PI) / 180;

  const parts: string[] = [];

  for (let i = 0; i <= FINENESS; i++) {
    const angle = startAngle - stepAngle * i;
    const x = cx + Math.sin(angle) * innerR;
    const y = cy + Math.cos(angle) * innerR;
    parts.push(i === 0 ? `M${x},${y}` : `L${x},${y}`);
  }

  for (let i = FINENESS; i >= 0; i--) {
    const angle = startAngle - stepAngle * i;
    const x = cx + Math.sin(angle) * outerR;
    const y = cy + Math.cos(angle) * outerR;
    parts.push(`L${x},${y}`);
  }

  parts.push('Z');
  return parts.join(' ');
}

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

  const sArrX = trX + LEN + CORNER_RADIUS - state.staplesSize / 2;
  const sArrY = trY - state.discretionaryCSize - CORNER_RADIUS;

  return (
    <>
      {/* Consumption bar */}
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

      {/* Staples corner + arrow */}
      <path
        d={cornerPath(trX + LEN, trY - state.discretionaryCSize - CORNER_RADIUS, 90, state.staplesSize)}
        fill={COLORS.staples}
      />
      <polygon
        points={`${sArrX},${sArrY - state.staplesSize} ${sArrX + state.staplesSize},${sArrY} ${sArrX - state.staplesSize},${sArrY}`}
        fill={COLORS.staples}
      />
      <Label
        x={sArrX}
        y={trY - state.discretionaryCSize - state.staplesSize - CORNER_RADIUS - 10}
        fill={COLORS.labelDark}
        anchor="middle"
      >
        Staples
      </Label>

      {/* Discretionary consumption bar + arrow */}
      <rect
        x={trX + LEN}
        y={trY - state.discretionaryCSize}
        width={2 * LEN}
        height={state.discretionaryCSize}
        fill={COLORS.discretionary}
      />
      <polygon
        points={`${trX + 3 * LEN + state.discretionaryCSize},${trY - state.discretionaryCSize / 2} ${trX + 3 * LEN},${trY + state.discretionaryCSize / 2} ${trX + 3 * LEN},${trY - (3 * state.discretionaryCSize) / 2}`}
        fill={COLORS.discretionary}
      />
      <Label
        x={trX + 2 * LEN}
        y={trY - state.discretionaryCSize / 2 - 5}
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
  return (
    <>
      <path
        d={cornerPath(endX + CORNER_RADIUS, num, 0, state.discretionaryISize)}
        fill={COLORS.discretionary}
      />
      <rect
        x={endX}
        y={ECON_SIZE / 2 + state.discretionaryISize}
        width={state.discretionaryISize}
        height={num - (ECON_SIZE / 2 + state.discretionaryISize)}
        fill={COLORS.discretionary}
      />
      <polygon
        points={`${endX + state.discretionaryISize / 2},${ECON_SIZE / 2} ${endX + (3 * state.discretionaryISize) / 2},${ECON_SIZE / 2 + state.discretionaryISize} ${endX - state.discretionaryISize / 2},${ECON_SIZE / 2 + state.discretionaryISize}`}
        fill={COLORS.discretionary}
      />
      <Label
        x={endX + (3 * state.discretionaryISize) / 2 - 4}
        y={ECON_SIZE / 2 + state.discretionaryISize + 4}
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
  const mEndX = -ECON_SIZE / 2 + ECON_SIZE / 3;
  const mCornerX = mEndX + CORNER_RADIUS - state.maintenanceSize / 2;

  return (
    <>
      <rect
        x={mCornerX}
        y={startY - state.eroiSize - state.maintenanceSize}
        width={endX + CORNER_RADIUS - mCornerX}
        height={state.maintenanceSize}
        fill={COLORS.maintenance}
      />
      <path
        d={cornerPath(
          mEndX + CORNER_RADIUS - state.maintenanceSize / 2,
          num + state.maintenanceSize,
          0,
          state.maintenanceSize,
        )}
        fill={COLORS.maintenance}
      />
      <rect
        x={mEndX - state.maintenanceSize / 2}
        y={ECON_SIZE / 2 + state.maintenanceSize}
        width={state.maintenanceSize}
        height={num + state.maintenanceSize - (ECON_SIZE / 2 + state.maintenanceSize)}
        fill={COLORS.maintenance}
      />
      <polygon
        points={`${mEndX},${ECON_SIZE / 2} ${mEndX + state.maintenanceSize},${ECON_SIZE / 2 + state.maintenanceSize} ${mEndX - state.maintenanceSize},${ECON_SIZE / 2 + state.maintenanceSize}`}
        fill={COLORS.maintenance}
      />
      <Label
        x={endX + CORNER_RADIUS - 5}
        y={startY - state.eroiSize - state.maintenanceSize / 2 - 5}
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
  const eroiEndX = -ECON_SIZE / 2 - WORK_GATE_SIZE / 2;
  const eroiEndY = WORK_GATE_SIZE / 4;

  return (
    <>
      <rect
        x={eroiEndX + CORNER_RADIUS - state.eroiSize / 2}
        y={startY - state.eroiSize}
        width={endX + CORNER_RADIUS - (eroiEndX + CORNER_RADIUS - state.eroiSize / 2)}
        height={state.eroiSize}
        fill={COLORS.energyAcquisition}
      />
      <path
        d={cornerPath(
          eroiEndX + CORNER_RADIUS - state.eroiSize / 2,
          num + state.maintenanceSize + state.eroiSize,
          0,
          state.eroiSize,
        )}
        fill={COLORS.energyAcquisition}
      />
      <rect
        x={eroiEndX - state.eroiSize / 2}
        y={eroiEndY + state.eroiSize}
        width={state.eroiSize}
        height={num + state.maintenanceSize + state.eroiSize - (eroiEndY + state.eroiSize)}
        fill={COLORS.energyAcquisition}
      />
      <polygon
        points={`${eroiEndX},${eroiEndY} ${eroiEndX + state.eroiSize},${eroiEndY + state.eroiSize} ${eroiEndX - state.eroiSize},${eroiEndY + state.eroiSize}`}
        fill={COLORS.energyAcquisition}
      />
      <Label
        x={eroiEndX + CORNER_RADIUS - state.eroiSize / 2 - 12}
        y={startY - state.eroiSize / 2 - 5}
        fill={COLORS.labelLight}
      >
        Energy Acquisition
      </Label>
    </>
  );
}

function InvestmentFlow({ state }: { state: SlicerState }) {
  const CR = CORNER_RADIUS;
  const trX = ECON_SIZE / 2 + 2 * LEN;
  const trY =
    ECON_SIZE / 2 - state.eroiSize - state.maintenanceSize - state.discretionaryISize + CR / 2;
  const investmentSize = state.discretionaryISize + state.eroiSize + state.maintenanceSize;

  const startY = ECON_SIZE / 2 + LEN + 2 * CR - investmentSize;
  const endX = -ECON_SIZE / 2 + (3 * ECON_SIZE) / 5;
  const num = trY + CR / 2 + LEN - state.eroiSize - state.maintenanceSize;

  return (
    <>
      {/* Main investment bar (vertical, from GDP) */}
      <rect
        x={trX - (3 * LEN) / 2}
        y={ECON_SIZE / 2 - investmentSize}
        width={(3 * LEN) / 2}
        height={investmentSize}
        fill={COLORS.investment}
      />

      {/* Corner going up-right */}
      <path d={cornerPath(trX, trY + CR / 2, 180, investmentSize)} fill={COLORS.investment} />

      {/* Vertical bar going up along right side */}
      <rect
        x={trX + CR - investmentSize}
        y={trY + CR / 2}
        width={investmentSize}
        height={LEN}
        fill={COLORS.investment}
      />

      {/* Corner at top turning left */}
      <path d={cornerPath(trX, trY + CR / 2 + LEN, 90, investmentSize)} fill={COLORS.investment} />

      {/* Horizontal bar going left across the top */}
      <rect
        x={endX + CR}
        y={startY - investmentSize}
        width={trX - (endX + CR)}
        height={investmentSize}
        fill={COLORS.investment}
      />

      <Label
        x={trX}
        y={ECON_SIZE / 2 - investmentSize / 2 - 5}
        fill={COLORS.labelLight}
        anchor="end"
      >
        Investment
      </Label>

      {/* Sub-flows */}
      <DiscretionaryInvestment state={state} endX={endX} num={num} />
      <MaintenanceFlow state={state} startY={startY} endX={endX} num={num} />
      <EnergyAcquisition state={state} startY={startY} endX={endX} num={num} />
    </>
  );
}

function EnergyFrame({ state }: { state: SlicerState }) {
  const endEnergyX = -200;
  const energySize = state.energySize;
  const arrowTipX = -ECON_SIZE / 2 - (3 * WORK_GATE_SIZE) / 4 - 5;
  const arrowBaseX = arrowTipX - energySize;

  return (
    <>
      {/* Bottom-right corner */}
      <path
        d={cornerPath(-CORNER_RADIUS + energySize / 2, -200, 180, energySize)}
        fill={COLORS.energy}
      />

      {/* Horizontal bar along bottom */}
      <rect
        x={endEnergyX}
        y={-200 - CORNER_RADIUS}
        width={-CORNER_RADIUS + energySize / 2 - endEnergyX}
        height={energySize}
        fill={COLORS.energy}
      />

      {/* Bottom-left corner */}
      <path d={cornerPath(endEnergyX, -200, 270, energySize)} fill={COLORS.energy} />

      {/* Vertical bar going up (canvas used negative height; SVG needs positive) */}
      <rect
        x={endEnergyX - CORNER_RADIUS}
        y={-200}
        width={energySize}
        height={200 - CORNER_RADIUS + energySize / 2}
        fill={COLORS.energy}
      />

      {/* Top-left corner */}
      <path
        d={cornerPath(endEnergyX, -CORNER_RADIUS + energySize / 2, 0, energySize)}
        fill={COLORS.energy}
      />

      {/* Horizontal bar between corner exit and arrowhead base */}
      {arrowBaseX > endEnergyX && (
        <rect
          x={endEnergyX}
          y={-energySize / 2}
          width={arrowBaseX - endEnergyX}
          height={energySize}
          fill={COLORS.energy}
        />
      )}

      {/* Arrow pointing right into work gate */}
      <polygon
        points={`${arrowTipX},0 ${arrowBaseX},${energySize} ${arrowBaseX},${-energySize}`}
        fill={COLORS.energy}
      />

      <Label
        x={endEnergyX + energySize}
        y={-200 - CORNER_RADIUS + energySize / 2 - 5}
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
