// Prefer first non-empty column in `keys`
export function get(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v != null && String(v).trim() !== "") return v.toString();
  }
  return "";
}

export function toNumber(v: string | undefined): number {
  if (!v) return NaN;
  const s = v.trim().replace(",", ".");
  // If the cell contains "H° and C" like "78 / 0.35", take the first number (H°).
  const m = s.match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : NaN;
}

export const H = {
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
}

// version based structure
// database_vnumber -
//                  -  stage_1
//                  -  stage_2

