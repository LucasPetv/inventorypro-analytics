export interface InventoryRow {
  Artikel: string;
  Inventurergebnis: number;//Inventurergebnis  
  Istbestand: number; //Aktueller Lagerbestand
  Preis: number;
  Verbrauch: number;
  Jahr: number;
  [key: string]: any;
}

export interface CalculatedKPIs extends InventoryRow {
  bestandswert: number;
  avgLagerbestand: number;
  umschlagshaeufigkeit: number;
  avgLagerdauer: number;
  kapitalbindungskosten: number;
  verbrauchswert: number;
  abcKlasse: 'A' | 'B' | 'C';
  // NEUE LAGERSTATUS FELDER
  lagerStatus: 'Totes Lager' | 'Beobachten' | 'OK';
  lagerStatusColor: 'red' | 'yellow' | 'green';
}

export interface ColumnMapping {
  Artikel: string;
  Istbestand: string;
  Inventurergebnis: string;
  Preis: string;
  Verbrauch: string;
  Jahr: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DATA_INPUT = 'DATA_INPUT',
  ANALYTICS = 'ANALYTICS',
  DATABASE = 'DATABASE',
  USER_MANUAL = 'USER_MANUAL',
  SETTINGS = 'SETTINGS'
}