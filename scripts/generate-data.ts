import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const csvPath = join(__dirname, '..', 'third_party', 'standalone_slicer', 'T21-NA', 'cheese data.csv');
const outPath = join(__dirname, '..', 'src', 'data', 'cheese-data.ts');

const csv = readFileSync(csvPath, 'utf-8');
const lines = csv.trim().split('\n');

const headerCols = lines[0].split(',');
const years = headerCols.slice(1).map(Number);

const rows = new Map<string, number[]>();
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(',');
  const name = cols[0].trim().toLowerCase();
  const values = cols.slice(1).map(s => parseFloat(s.trim()));
  rows.set(name, values);
}

const energy = rows.get('energy')!;
const energyMax = Math.max(...energy) * 3;

mkdirSync(dirname(outPath), { recursive: true });

const output = `// GENERATED - do not edit
// Source: third_party/standalone_slicer/T21-NA/cheese data.csv

export const START_YEAR = ${years[0]};
export const END_YEAR = ${years[years.length - 1]};
export const ENERGY_MAX = ${energyMax};

export const consumption = ${JSON.stringify(rows.get('consumption'))} as const;
export const investment = ${JSON.stringify(rows.get('investment'))} as const;
export const eroi = ${JSON.stringify(rows.get('eroi'))} as const;
export const metabolism = ${JSON.stringify(rows.get('metabolism'))} as const;
export const fsc = ${JSON.stringify(rows.get('fsc'))} as const;
export const energy = ${JSON.stringify(energy)} as const;
`;

writeFileSync(outPath, output);
console.log(`Generated ${outPath}`);
