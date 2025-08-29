import type { Compound } from "../core/models/compund.model";
import { DEFAULT_BOUNDS } from "./rw";

export interface RangeParams {
    rf?: [number, number];
    dev254?: [number, number];
    dev366?: [number, number];
    vsnp?: [number, number];
    t?: [number, number];
    uv_num?: number;
    uv?: [number, number][];
    fl_num?: number;
    fl?: [number, number][];
}

export function generateRangeParams(reference: Compound, bounds = DEFAULT_BOUNDS): RangeParams {
    const result: RangeParams = {};
    result.rf = bounds.RF ? [reference.RF - bounds.RF, reference.RF + bounds.RF] : undefined;
    result.dev254 = bounds.DEV_254nm ? [reference.DEV_254nm - bounds.DEV_254nm, reference.DEV_254nm + bounds.DEV_254nm] : undefined;
    result.dev366 = bounds.DEV_366nm ? [reference.DEV_366nm - bounds.DEV_366nm, reference.DEV_366nm + bounds.DEV_366nm] : undefined;
    result.vsnp = bounds.VSNP_366nm ? [reference.VSNP_366nm - bounds.VSNP_366nm, reference.VSNP_366nm + bounds.VSNP_366nm] : undefined;
    result.t = bounds.T ? [reference.T! - bounds.T, reference.T! + bounds.T] : undefined;
    result.uv_num = reference.UV_Peaks_num;
    result.fl_num = reference.FL_Peaks_num;
    result.uv = [];
    result.fl = [];
    for (let i = 0; i < (reference.UV_Peaks_num || 0); i++) {
        if (bounds.UV_Peak) {
            result.uv.push([
                reference.UV_Peaks[i] * (1 - bounds.UV_Peak),
                reference.UV_Peaks[i] * (1 + bounds.UV_Peak)
            ]);
        }
    }
    for (let i = 0; i < (reference.FL_Peaks_num || 0); i++) {
        if (bounds.FL_Peak) {
            result.fl.push([
                reference.FL_Peaks[i] * (1 - bounds.FL_Peak),
                reference.FL_Peaks[i] * (1 + bounds.FL_Peak)
            ]);
        }
    }
    return result;
}
