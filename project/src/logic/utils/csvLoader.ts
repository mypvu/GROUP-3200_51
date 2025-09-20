import fs from "node:fs";
import Papa from "papaparse";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Compound, DBLabel, Sample } from "../core/models/compund.model";
import DataSets from "../core/models/datasets.model";

// types: DBLabel = "NK" | "NL" | "VK" | "VL";
// type Compound = { /* your fields */ };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Prefer first non-empty column in `keys`
function get(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v != null && String(v).trim() !== "") return v;
  }
  return "";
}

function toNumber(v: string | undefined): number {
  if (!v) return NaN;
  const s = v.trim().replace(",", ".");
  // If the cell contains "H° and C" like "78 / 0.35", take the first number (H°).
  const m = s.match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : NaN;
}

const H = {
  code: ["Code", "ID"],
  name: ["Name of Compound and Subclass"],

  rf_mpb: ["Rf (MPB)", "Rf(MPB)", "Rf MPB"],
  rf_mpa: ["Rf (MPA)", "Rf(MPA)", "Rf MPA"],

  dev254: ["254 nm DEV H° and C", "H° DEV 254 nm"],
  dev366: ["366 nm DEV H° and C", "H° DEV 366 nm"],
  vsa366: ["366 nm VSA  H° and C", "366 nm VSA H° and C", "H° NP 366 nm"],

  t_vsa: ["T VSA H° and C", "T"],

  uv_peaks_num: ["UV-Vis Peaks"],
  uv1: ["UV λ1", "UV λ 1"],
  uv2: ["UV λ2", "UV λ 2"],
  uv3: ["UV λ3", "UV λ 3"],

  fl_peaks_num: ["Fl Peaks", "FL Peaks"],
  fl1: ["Fl λ 1", "Fl λ1"],
  fl2: ["Fl λ 2", "Fl λ2"],
  fl3: ["Fl λ 3", "Fl λ3"],
};

export function load(path: string, label: DBLabel): Compound[] {
  // pass path like "./data/1NP.csv"
  const abs = resolve(__dirname, path);
  const csv = fs.readFileSync(abs, "utf8");
  const parsed = Papa.parse<Record<string, string>>(csv, { header: true }).data;

  const rfHeader = label === "NK" || label === "VK" ? H.rf_mpb : H.rf_mpa;

  return parsed.map((row, idx) => {
    const id = toNumber(get(row, H.code));

    const RF = toNumber(get(row, rfHeader));

    const DEV_254nm = toNumber(get(row, H.dev254));
    const DEV_366nm = toNumber(get(row, H.dev366));
    const VSNP_366nm = toNumber(get(row, H.vsa366));

    const UV_Peaks_num = Number.isNaN(toNumber(get(row, H.uv_peaks_num)))
      ? 0
      : Math.trunc(toNumber(get(row, H.uv_peaks_num)));

    const UV_Peaks = [get(row, H.uv1), get(row, H.uv2), get(row, H.uv3)]
      .map(toNumber)
      .filter((n) => !Number.isNaN(n)) as number[];

    const FL_Peaks_num = Number.isNaN(toNumber(get(row, H.fl_peaks_num)))
      ? 0
      : Math.trunc(toNumber(get(row, H.fl_peaks_num)));

    const FL_Peaks = [get(row, H.fl1), get(row, H.fl2), get(row, H.fl3)]
      .map(toNumber)
      .filter((n) => !Number.isNaN(n)) as number[];

    // Only meaningful for V-K/V-L datasets; keep null otherwise
    const Traw = get(row, H.t_vsa);
    const T = Traw ? toNumber(Traw) : null;

    return {
      id,
      db_label: label,
      RF,
      DEV_254nm,
      DEV_366nm,
      VSNP_366nm,
      UV_Peaks_num,
      UV_Peaks,
      FL_Peaks_num,
      FL_Peaks,
      T,
      // If you later want the long name, you can keep it too:
      // name: get(row, H.name),
    } as unknown as Compound;
  });
}


// Example: load your four CSVs
const NK = load("./data/NK.csv", "NK");
const NL = load("./data/NL.csv", "NL");
const VK = load("./data/VK.csv", "VK");
const VL = load("./data/VL.csv", "VL");

// Create DataSets
const ds = new DataSets(NK, NL, VK, VL);

// Create a sample (pick first entry from each DB)
const sample: Sample = {
    NP_KDS: NK[1],
    NP_LDS: NL[1],
    VS_KDS: VK[1],
    VS_LDS: VL[1],
};

// console.log(sample)

export { ds, sample };

