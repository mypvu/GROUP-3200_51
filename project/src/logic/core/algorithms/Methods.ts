import type { Compound } from "@core/models/compund.model";

export enum RI {
    A = 0,
    B = 1
}

export function rf_predicate(range: [number, number]) {
    return (c: Compound): boolean => 
        typeof c.RF === "number" && c.RF !== null && c.RF >= range[RI.A] && c.RF <= range[RI.B];
}

export function DEV_254nm_predicate(range: [number, number]) {
    if (range[RI.A] < 0){
        range[RI.A] += 360;
        return (c: Compound): boolean =>
            typeof c.DEV_254nm === "number" && (c.DEV_254nm >= range[RI.A] && c.DEV_254nm <= 360 || c.DEV_254nm <= range[RI.B]&& c.DEV_254nm >=0);
    }
    if (range[RI.B] > 360){
        range[RI.B] -= 360;
        return (c: Compound): boolean =>
            typeof c.DEV_254nm === "number" && (c.DEV_254nm >= range[RI.A] && c.DEV_254nm <= 360 || c.DEV_254nm <= range[RI.B]&& c.DEV_254nm >=0);
    }
    return (c: Compound): boolean =>
        typeof c.DEV_254nm === "number" && c.DEV_254nm >= range[RI.A] && c.DEV_254nm <= range[RI.B];
}

export function DEV_366nm_predicate(range: [number, number]) {
    if (range[RI.A] < 0){
        range[RI.A] += 360;
        return (c: Compound): boolean =>
            typeof c.DEV_366nm === "number" && (c.DEV_366nm >= range[RI.A] && c.DEV_366nm <= 360 || c.DEV_366nm <= range[RI.B]&& c.DEV_366nm >=0);
    }
    if (range[RI.B] > 360){
        range[RI.B] -= 360;
        return (c: Compound): boolean =>
            typeof c.DEV_366nm === "number" && (c.DEV_366nm >= range[RI.A] && c.DEV_366nm <= 360 || c.DEV_366nm <= range[RI.B]&& c.DEV_366nm >=0);
    }
    return (c: Compound): boolean =>
        typeof c.DEV_366nm === "number" && c.DEV_366nm >= range[RI.A] && c.DEV_366nm <= range[RI.B];
}

export function VSNP_366nm_predicate(range: [number, number]) {
    if (range[RI.A] < 0){
        range[RI.A] += 360;
        return (c: Compound): boolean =>
            typeof c.VSNP_366nm === "number" && (c.VSNP_366nm >= range[RI.A] && c.VSNP_366nm <= 360 || c.VSNP_366nm <= range[RI.B]&& c.VSNP_366nm >=0);
    }
    if (range[RI.B] > 360){
        range[RI.B] -= 360;
        return (c: Compound): boolean =>
            typeof c.VSNP_366nm === "number" && (c.VSNP_366nm >= range[RI.A] && c.VSNP_366nm <= 360 || c.VSNP_366nm <= range[RI.B]&& c.VSNP_366nm >=0);
    }
    return (c: Compound): boolean =>
        typeof c.VSNP_366nm === "number" && c.VSNP_366nm >= range[RI.A] && c.VSNP_366nm <= range[RI.B];
}

export function T_predicate(range: [number, number]) {
    if (range[RI.A] < 0){
        range[RI.A] += 360;
        return (c: Compound): boolean =>
            typeof c.T === "number" && (c.T >= range[RI.A] && c.T <= 360 || c.T <= range[RI.B]&& c.T >=0);
    }
    if (range[RI.B] > 360){
        range[RI.B] -= 360;
        return (c: Compound): boolean =>
            typeof c.T === "number" && (c.T >= range[RI.A] && c.T <= 360 || c.T <= range[RI.B]&& c.T >=0);
    }
    return (c: Compound): boolean =>
        typeof c.T === "number" && c.T >= range[RI.A] && c.T <= range[RI.B];
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
        return c.UV_Peaks.every((peak, i) => peak >= range[i][RI.A] && peak <= range[i][RI.B]);
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
        return c.FL_Peaks.every((peak, i) => peak >= range[i][RI.A] && peak <= range[i][RI.B]);
    };
}
