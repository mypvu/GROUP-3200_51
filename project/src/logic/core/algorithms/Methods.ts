import type { Compound } from "@core/models/compund.model";

export enum RI {
    MIN = 0,
    MAX = 1
}

export function rf_predicate(range: [number, number]) {
    // console.log(range)
    return (c: Compound): boolean => 
        typeof c.RF === "number" && c.RF !== null && c.RF >= range[RI.MIN] && c.RF <= range[RI.MAX];
}

export function DEV_254nm_predicate(range: [number, number]) {
    return (c: Compound): boolean =>
        typeof c.DEV_254nm === "number" && c.DEV_254nm >= range[RI.MIN] && c.DEV_254nm <= range[RI.MAX];
}

export function DEV_366nm_predicate(range: [number, number]) {
    return (c: Compound): boolean =>
        typeof c.DEV_366nm === "number" && c.DEV_366nm >= range[RI.MIN] && c.DEV_366nm <= range[RI.MAX];
}

export function VSNP_366nm_predicate(range: [number, number]) {
    return (c: Compound): boolean =>
        typeof c.VSNP_366nm === "number" && c.VSNP_366nm >= range[RI.MIN] && c.VSNP_366nm <= range[RI.MAX];
}

export function T_predicate(range: [number, number]) {
    return (c: Compound): boolean =>
        typeof c.T === "number" && c.T >= range[RI.MIN] && c.T <= range[RI.MAX];
}

export function UV_Peaks_num_predicate(predicate_uv_num: number) {
    return (c: Compound): boolean =>
        typeof c.UV_Peaks_num === "number" && c.UV_Peaks_num === predicate_uv_num;
};

export function UV_Peaks_predicate(range: [number, number][]) {
    return (c: Compound): boolean => {
        if (!Array.isArray(c.UV_Peaks) || c.UV_Peaks.length !== range.length || !c.UV_Peaks.every(peak => typeof peak === "number" && !Number.isNaN(peak))) {
            return false;
        }
        return c.UV_Peaks.every((peak, i) => peak >= range[i][RI.MIN] && peak <= range[i][RI.MAX]);
    };
}

export function FL_Peaks_num_predicate(predicate_fl_num: number) {
    return (c: Compound): boolean =>
        typeof c.FL_Peaks_num === "number" && c.FL_Peaks_num === predicate_fl_num;
};

export function FL_Peaks_predicate(range: [number, number][]) {
    return (c: Compound): boolean => {
        if (!Array.isArray(c.FL_Peaks) || c.FL_Peaks.length !== range.length || !c.FL_Peaks.every(peak => typeof peak === "number" && !Number.isNaN(peak))) {
            return false;
        }
        return c.FL_Peaks.every((peak, i) => peak >= range[i][RI.MIN] && peak <= range[i][RI.MAX]);
    };
}
