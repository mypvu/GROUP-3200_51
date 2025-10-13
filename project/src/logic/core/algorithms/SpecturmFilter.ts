import type { Compound } from "../models/compund.model";
import type { ResultStage2 } from "../models/result_parameters.model";
import conf from "../../config/conf.json"
import type { Version } from "../models/version.model";
import type Specturm from "../models/specturm.model"; 
import { MethodsType, Stage2Methods, type Plot, type SpecturmsOnly, type UpperLowerBound } from "../models/specturm.model";
import { fetchAndParseXY, parseXYFromArrayBuffer, parseXYFromUnkownArrayBuffer, type Point } from "@/logic/utils/fetch_excel_st2";
import { getConfidence, getUpperLowerBound } from "@/logic/utils/get_spectrum_confidence";
import { getImageNameFromExcel } from "@/logic/utils/naming_mapping";

export default class SpecturmFilter {
    public candidates: Compound[]
    public unknowns?: SpecturmsOnly
    private baseUrl: string
    private version: Version

    constructor(candidates: Compound[], version = "1") {
        this.candidates = candidates
        this.version = version
        this.baseUrl = conf.database_url +
            "/v" + version +
            "/stage_2"
    }

    public set(candidates: Compound[], version = "1", unknown: SpecturmsOnly): SpecturmFilter {
        this.unknowns = unknown
        this.candidates = candidates
        this.version = version
        this.baseUrl = conf.database_url +
            "/v" + version +
            "/stage_2"

        return this
    }

    async extract(): Promise<ResultStage2> {
        let specturms: Specturm[] = []
        let currentSpecturms: Specturm[] = []

        if (!this.unknowns)
            throw new Error("Unknows Specturms has not initialized")

        for (const c of this.candidates) {
            if (!c?.name) continue

            currentSpecturms = await this.fetchSpecturmMethods(c)
            specturms = specturms.concat(currentSpecturms)

            for (const s of specturms) {
                s.confidence = getConfidence(s.plot, 
                    this.selectUnknownPlot(this.unknowns, s.method))
                s.upperLowerBound = getUpperLowerBound(s.plot)
            }
        }
        
        return {
            specturms,
            version: this.version
        }
    }

    private makeUrl(method: string, compoundName: string): URL {
        return new URL(this.baseUrl + "/" + method + "/" + compoundName)
    }

    public compare(candidate: Specturm, target: Specturm): boolean {
        return true
    }


    /**
     * Fetch all Stage2 spectra for a single compound.
     * Skips any failures and returns only successful spectra.
     */
    private async fetchSpecturmMethods(compound: Compound): Promise<Specturm[]> {
        const name = compound?.name
        if (!name) return []

        const jobs = (Stage2Methods as MethodsType[]).map((method) =>
            this.fetchSpecturm(compound, method)
        )

        const settled = await Promise.allSettled(jobs)
        const results: Specturm[] = []

        for (const s of settled) {
            if (s.status === "fulfilled" && s.value)
                results.push(s.value)
            // console.log(s.value.compound)
        }
        return results
    }

    /**
     * Fetch a single spectrum for a compound/method via the provided helper.
     * Assumes fetchAndParseXY(url) returns { Xs: number[], Ys: number[] }.
     */
    private async fetchSpecturm(compound: Compound, method: MethodsType): Promise<Specturm> {
        const name = getImageNameFromExcel(compound.name) + ".xlsx"

        if (!name)
            throw new Error("Compound name is required")

        const url = this.makeUrl(method, name)
        const plot = await fetchAndParseXY(url) // -> { Xs, Ys }

        return {
            name,
            compound,
            method,
            plot
        }
    }

    private selectUnknownPlot(specturms: SpecturmsOnly, method: MethodsType): Plot {
        let buffer: ArrayBuffer

        switch(method) {

            case MethodsType.FD:
                buffer = specturms.DF
                break
            case MethodsType.FDN:
                buffer = specturms.FDN
                break
            case MethodsType.FDV:
                buffer = specturms.FDV
                break
            case MethodsType.UD:
                buffer = specturms.UD
                break
            case MethodsType.UDP:
                buffer = specturms.UDP
                break
            case MethodsType.UDV:
                buffer = specturms.UDV
                break

            default:
                throw new Error("No matching specturm methods found ")
        }

        return parseXYFromUnkownArrayBuffer(buffer)
        
    }

}