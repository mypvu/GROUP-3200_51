import { read as read_excel, type WorkBook } from "xlsx"
import * as XLSX from "xlsx"
import DataSets from "../core/models/datasets.model";
import type { Compound, DBLabel } from "../core/models/compund.model";
import { get, H, toNumber } from "./utils";
import download_from_url, { download_json } from "./network";


export async function fetch_dataset(url: URL): Promise<DataSets> {
		return await fetch_datasets_from_manifest(new URL(url.toString() + "/manifest.json"))
}

async function fetch_datasets_from_manifest(url: URL): Promise<DataSets> {

	const manifest = await download_json(url)

	let files: Array<{ name?: string; url?: string; path?: string }>;
	if ("files" in manifest && Array.isArray(manifest.files)) {
		files = manifest.files;
	} 
	else if (manifest.type === "versions") {
		
		const next = manifest.latest?.manifest ?? manifest.versions?.[0]?.manifest;
		if (!next) 
			throw new Error("No version manifest found in stage manifest.");
		const verUrl = new URL(next, url);

		const r2 = await fetch(verUrl.toString(), { cache: "default" });
		if (!r2.ok) 
			throw new Error(`Failed to load version manifest: ${r2.status} ${verUrl}`);

		const ver = await r2.json();
		if (!Array.isArray(ver.files)) 
			throw new Error("Version manifest has no files[]");

		files = ver.files;
	} else {
		throw new Error("Unexpected manifest schema.");
	}

	const NK: Compound[] = [];
	const NL: Compound[] = [];
	const VK: Compound[] = [];
	const VL: Compound[] = [];

	await Promise.all(
		files.map(async (f) => {
			const href =
				(typeof f.url === "string" && f.url) ||
				(typeof f.path === "string" ? new URL(f.path, url).toString() : null);
			if (!href) return;

			const name = String(f.name ?? f.path ?? f.url ?? "");
			const label = inferLabelFromFilename(name);
			if (!label) return;

			const list = await fetch_excel(new URL(href, url), label);
			const withLabel = list.map((c) => ({ ...c, db_label: label as DBLabel })) as Compound[];

			switch (label) {
				case "NK": NK.push(...withLabel); break;
				case "NL": NL.push(...withLabel); break;
				case "VK": VK.push(...withLabel); break;
				case "VL": VL.push(...withLabel); break;
			}
		})
	);

	return new DataSets(NK, NL, VK, VL);
}

function inferLabelFromFilename(name: string): DBLabel | null {
	const tokens = name
		.toLowerCase()
		.replace(/\.[^.]+$/, "")
		.split(/[\s._-]+/)
		.filter(Boolean);

	const hasK = tokens.includes("kds");
	const hasL = tokens.includes("lds");
	const hasN = tokens.includes("np");
	const hasV = tokens.includes("vs");

	if (hasN && hasK) return "NK";
	if (hasN && hasL) return "NL";
	if (hasV && hasK) return "VK";
	if (hasV && hasL) return "VL";
	return null;
}



export async function fetch_excel(url: URL, label: DBLabel): Promise<Compound[]> {

	const buf = await download_from_url(url)

	return await parse_excel(buf, label)
}


export async function parse_excel(buf: ArrayBuffer, label: DBLabel): Promise<Compound[]> {

	const wb: WorkBook = read_excel(buf, { type: "array" })
	const ws = wb.Sheets[wb.SheetNames[0]] // take the first page which is "D"

	const rows = XLSX.utils.sheet_to_json<string[]>(ws, {
		header: 1,          // output as array-of-arrays
		defval: null,
		blankrows: false,
	})

	const headers = rows[0] as string[];
	const data = rows.slice(1)

	const objects = data.map((row) =>
		Object.fromEntries(headers.map((h, i) => [h || `Col${i + 1}`, row[i]]))
	)

	const cmps: Compound[] = objects.map(o => mapRowToCompound(o, label))

	return cmps
}


function mapRowToCompound(row: Record<string, string>, label: DBLabel): Compound {
	const rfHeader = label === "NK" || label === "VK" ? H.rf_mpb : H.rf_mpa;
	let name = get(row, H.name);
	name = name.includes(",")
		? name.slice(0, name.lastIndexOf(",")).trim()
		: name.trim();
	
	const id = toNumber(get(row, H.code));
	const RF = toNumber(get(row, rfHeader));

	const DEV_254nm = toNumber(get(row, H.dev254));
	const DEV_366nm = toNumber(get(row, H.dev366));
	const VSNP_366nm = toNumber(get(row, H.vsa366));

	const UV_Peaks_num_raw = toNumber(get(row, H.uv_peaks_num));
	const UV_Peaks_num = Number.isNaN(UV_Peaks_num_raw) ? 0 : Math.trunc(UV_Peaks_num_raw);

	const UV_Peaks = [get(row, H.uv1), get(row, H.uv2), get(row, H.uv3)]
		.map(toNumber)
		.filter((n) => Number.isFinite(n)) as number[];

	const FL_Peaks_num_raw = toNumber(get(row, H.fl_peaks_num));
	const FL_Peaks_num = Number.isNaN(FL_Peaks_num_raw) ? 0 : Math.trunc(FL_Peaks_num_raw);

	const FL_Peaks = [get(row, H.fl1), get(row, H.fl2), get(row, H.fl3)]
		.map(toNumber)
		.filter((n) => Number.isFinite(n)) as number[];

	const Traw = get(row, H.t_vsa);
	const T = Traw ? toNumber(Traw) : null;

	return {
		id,
		name,
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
		// name: get(row, H.name), // keep if you want it
	} as Compound;
}