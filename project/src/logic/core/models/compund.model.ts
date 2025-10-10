export type DBLabel = "NK" | "NL" | "VK" | "VL";

interface CompoundBase {
    id?: number;
    name?: string;
    db_label: DBLabel;
    RF?: number; // retention factor
    DEV_254nm?: number; // Color 1 (e.g., "blue", hex, code)
    DEV_366nm?: number; // Color 2
    VSNP_366nm?: number; // Color 3
    UV_Peaks_num?: number; // number of UV peaks
    UV_Peaks?: number[]; // list<float>
    FL_Peaks_num?: number; // number of FL peaks
    FL_Peaks?: number[]; // list<float>
}

export interface CompoundN extends CompoundBase {
    db_label: "NK" | "NL";
    T?: undefined; // explicitly not present
}

export interface CompoundV extends CompoundBase {
    db_label: "VK" | "VL";
    T: number | null; // only for B databases
}

// Aliases for clarity
export type CompoundNP = CompoundN;
export type CompoundNL = CompoundN;
export type CompoundVK = CompoundV;
export type CompoundVL = CompoundV;

export interface Sample {
    NP_KDS?: CompoundNP;
    NP_LDS?: CompoundNL;
    VS_KDS?: CompoundVK;
    VS_LDS?: CompoundVL;
}

export type Compound = CompoundN | CompoundV;

export function isCompoundN(c: Compound): c is CompoundN {
    return c.db_label === "NK" || c.db_label === "NL";
}

/** Type guards (handy when branching on db_label) */
export function isCompoundV(c: Compound): c is CompoundV {
    return c.db_label === "VK" || c.db_label === "VL";
}