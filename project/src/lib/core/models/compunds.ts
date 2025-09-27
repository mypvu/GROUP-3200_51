// src/lib/core/models/compound.ts

/** Database label: "1A", "1B", "2A", "2B" */
export type DBLabel = "1A" | "1B" | "2A" | "2B";

/** Shared fields across all compounds */
interface CompoundBase {
  id: string;                    // or number, if you prefer
  db_label: DBLabel;
  RF: number;                    // retention factor
  DEV_254nm: string;             // Color 1 (e.g., "blue", hex, code)
  DEV_366nm: string;             // Color 2
  VSNP_366nm: string;            // Color 3
  UV_Peaks: number[];            // list<float>
  FL_Peaks: number[];            // list<float>
}

/** Databases A: no T */
export interface CompoundA extends CompoundBase {
  db_label: "1A" | "2A";
  T?: undefined;                 // explicitly not present
}

/** Databases B: T is present (float or null) */
export interface CompoundB extends CompoundBase {
  db_label: "1B" | "2B";
  T: number | null;              // only for B databases
}

/** Union type you’ll use everywhere */
export type Compound = CompoundA | CompoundB;

/** Type guards (handy when branching on db_label) */
export function isCompoundB(c: Compound): c is CompoundB {
  return c.db_label === "1B" || c.db_label === "2B";
}

export function isCompoundA(c: Compound): c is CompoundA {
  return c.db_label === "1A" || c.db_label === "2A";
}
