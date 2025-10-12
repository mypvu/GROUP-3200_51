import * as XLSX from "xlsx"
import type { Plot } from "../core/models/specturm.model";


export type Point = { x: number; y: number };

type Cell = string | number | null | undefined;

/**
 * Parse a Stage-2 style Excel into XY points from the first two columns.
 * - Finds the header row (looks for "λ (nm)" / "ABS"; falls back to the first non-empty row)
 * - Skips the "Center" row and any non-numeric lines
 * - Stops when the first column is no longer numeric
 */



export function parseXYFromArrayBuffer(
    data: ArrayBuffer | Buffer,
    opts: { sheetName?: string } = {}
): Point[] {
    const wb = XLSX.read(data, { type: "array" });
    const sheetName = opts.sheetName ?? wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    if (!ws) return [];

    // 2D matrix of cells
    const grid: Cell[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true }) as Cell[][];

    if (!grid.length) return [];

    // 1) header row index
    let headerRow = grid.findIndex(
        r =>
            r?.some?.(c => String(c ?? "").toLowerCase().includes("λ")) &&
            r?.some?.(c => String(c ?? "").toLowerCase().includes("abs"))
    );
    if (headerRow < 0) {
        headerRow = grid.findIndex(r => r?.some?.(c => (typeof c === "string" && c.trim())));
    }
    if (headerRow < 0) return [];

    // 2) first data row = first row after header whose col0 is numeric (skips "Center")
    let firstData = headerRow + 1;
    while (firstData < grid.length && !isFiniteNumber(grid[firstData]?.[0])) firstData++;

    const points: Point[] = [];

    for (let r = firstData; r < grid.length; r++) {
        const row = grid[r] ?? [];
        const a = row[0];
        const b = row[1];

        // stop if the row is blank-ish
        if (!hasAnyValue(row)) break;

        // ignore non-numeric x
        if (!isFiniteNumber(a)) continue;

        // skip "*" and "Center" etc.
        if (String(a ?? "").trim() === "*" || String(b ?? "").trim() === "*" || String(a ?? "").toLowerCase() === "center")
            continue;

        const x = Number(a);
        const y = toNumberOrNaN(b);

        if (Number.isFinite(x) && Number.isFinite(y)) {
            points.push({ x, y });
        }
    }

    return points;
}


/** Convenience: fetch one Excel by URL and return XY points */
export async function fetchAndParseXY(url: URL, sheetName = "1"): Promise<Plot> {
    const res = await fetch(url);
    // if (!res.ok) {
    //     console.log(res.status)
    //     console.log(url)
    // }

    if (!res.ok)
        throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);

    const ab = await res.arrayBuffer();
    return parseXYFromArrayBuffer(ab, { sheetName });
}

// ---------------- helpers ----------------
function isFiniteNumber(v: Cell): boolean {
    if (typeof v === "number") return Number.isFinite(v);
    const n = Number(String(v ?? "").trim());
    return Number.isFinite(n);
}
function toNumberOrNaN(v: Cell): number {
    if (v == null) return NaN;
    if (typeof v === "number") return v;
    const s = String(v).trim();
    if (s === "" || s === "*") return NaN;
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
}
function hasAnyValue(row: Cell[]): boolean {
    return row.some(c => c != null && String(c).trim() !== "");
}

