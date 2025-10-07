// Data shape used at the app boundary (API/storage)
export type DBLabel = "1A" | "1B" | "2A" | "2B";

export interface CompoundDTO {
  id: string;            // or number
  db_label: DBLabel;
  RF: number;

  DEV_254nm: string;     // Color 1
  DEV_366nm: string;     // Color 2
  VSNP_366nm: string;    // Color 3

  T?: number | null;     // only for "1B" | "2B"

  UV_Peaks: number[];    // list<float>
  FL_Peaks: number[];    // list<float>
}
