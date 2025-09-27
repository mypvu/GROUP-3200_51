import fs from "node:fs";
import Papa from "papaparse";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Compound, DBLabel, Sample } from "../core/models/compund.model";
import DataSets from "../core/models/datasets.model";
import { get, H, toNumber } from "./utils";

// types: DBLabel = "NK" | "NL" | "VK" | "VL";
// type Compound = { /* your fields */ };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function load_csv(path: string, label: DBLabel): Compound[] {
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
const NK = load_csv("./data/NK.csv", "NK");
const NL = load_csv("./data/NL.csv", "NL");
const VK = load_csv("./data/VK.csv", "VK");
const VL = load_csv("./data/VL.csv", "VL");

const ds = new DataSets(NK, NL, VK, VL);

const sample: Sample = {
    NP_KDS: NK[1],
    NP_LDS: NL[1],
    VS_KDS: VK[1],
    VS_LDS: VL[1],
};

export { ds, sample };

