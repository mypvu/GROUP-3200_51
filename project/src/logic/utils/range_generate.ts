import type { Compound } from "$lib/core/models/compund.model";
import { DEFAULT_PARAMS } from "./rw";

export interface RangeParams {
    rf?: [number, number];
    dev254?: [number, number];
    dev366?: [number, number];
    vsnp?: [number, number];
    t?: [number, number];
    uv?: [number, number];
    fl?: [number, number];
}

export function generateRangeParams(reference: Compound, params = DEFAULT_PARAMS): RangeParams {
    return {
        rf: params.RF ? [reference.RF - params.RF, reference.RF + params.RF] : undefined,
        dev254: params.DEV_254nm ? [reference.DEV_254nm - params.DEV_254nm, reference.DEV_254nm + params.DEV_254nm] : undefined,
        dev366: params.DEV_366nm ? [reference.DEV_366nm - params.DEV_366nm, reference.DEV_366nm + params.DEV_366nm] : undefined,
        vsnp: params.VSNP_366nm ? [reference.VSNP_366nm - params.VSNP_366nm, reference.VSNP_366nm + params.VSNP_366nm] : undefined,
        t: params.T ? [reference.T! - params.T, reference.T! + params.T] : undefined,
        uv: params.UV_Peaks ? [reference.UV_Peaks - params.UV_Peaks, reference.UV_Peaks + params.UV_Peaks] : undefined,
        fl: params.FL_Peaks ? [reference.FL_Peaks - params.FL_Peaks, reference.FL_Peaks + params.FL_Peaks] : undefined,
    };
}