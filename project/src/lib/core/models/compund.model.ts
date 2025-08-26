import { expectTypeOf } from "vitest";

export type DBLabel = "A1" | "A2" | "B1" | "B2";

interface CompoundBase {
  id: string;                    // or number, if you prefer
  db_label: DBLabel;
  RF: number;                    // retention factor
  DEV_254nm: number;             // Color 1 (e.g., "blue", hex, code)
  DEV_366nm: number;             // Color 2
  VSNP_366nm: number;            // Color 3
  UV_Peaks: number;            // list<float>
  FL_Peaks: number;            // list<float>
}

export interface Sample {
  NP1: CompoundA,
  NP2: CompoundA,
  VS1: CompoundB,
  VS2: CompoundB
}

export interface CompoundA extends CompoundBase {
  db_label: "A1" | "B1";
  T?: undefined;                 // explicitly not present
}

export interface CompoundB extends CompoundBase {
  db_label: "A2" | "B2";
  T: number | null;              // only for B databases
}

export type Compound = CompoundA | CompoundB;

/** Type guards (handy when branching on db_label) */
export function isCompoundB(c: Compound): c is CompoundB {
  return c.db_label === "B1" || c.db_label === "B2";
}

export function isCompoundA(c: Compound): c is CompoundA {
  return c.db_label === "A1" || c.db_label === "A2";
}
