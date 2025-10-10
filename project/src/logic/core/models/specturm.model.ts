import type { Point } from "@/logic/utils/fetch_excel_st2"
import type { Compound } from "./compund.model"

export default interface Specturm {
    name: string
    compound: Compound
    method: MethodsType
    plot: Plot
    confidence?: number
}

export interface CompoundSpecturms {
    compound: Compound,
    DF: Plot,
    UD: Plot,
    FDN: Plot,
    FDV: Plot,
    UDP: Plot,
    UDV: Plot
}

export type Plot = Point[]

export enum MethodsType {
    DF = "DEV_FL",
    UD = "UV_DEV",
    FDN = "FL_DER_NP",
    FDV = "FL_DER_VSA",
    UDP = "UV_DER_NP",
    UDV = "UV_DER_VSA",
}

export const Stage2Methods: string[] = [
    MethodsType.DF, MethodsType.UD, MethodsType.FDN, 
    MethodsType.FDV, MethodsType.UDP, MethodsType.UDV]