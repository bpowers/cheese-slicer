export interface SlicerState {
  discretionaryCSize: number;
  staplesSize: number;
  discretionaryISize: number;
  maintenanceSize: number;
  eroiSize: number;
  energySize: number;
}

export interface YearData {
  consumption: number;
  staples: number;
  investment: number;
  maintenance: number;
  eroi: number;
  energy: number;
}
