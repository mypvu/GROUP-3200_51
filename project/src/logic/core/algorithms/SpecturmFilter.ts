import type { Compound } from "../models/compund.model";
import type { ResultStage2 } from "../models/result_parameters.model";
import conf from "../../config/conf.json"
import type { Version } from "../models/version.model";
import type Specturm from "../models/specturm.model";
import { Stage2Methods, type MethodsType, type Plot } from "../models/specturm.model";
import { fetchAndParseXY, type Point } from "@/logic/utils/fetch_excel_st2";
import { getConfidence } from "@/logic/utils/get_spectrum_confidence";
import { getImageNameFromExcel } from "@/logic/utils/naming_mapping";

export default class SpecturmFilter {
    public candidates: Compound[]
    public un: Plot
    private baseUrl: string
    private version: Version

    constructor(candidates: Compound[], version = "1") {
        this.candidates = candidates
        this.version = version
        this.baseUrl = conf.database_url +
            "/v" + version +
            "/stage_2"
    }

    public set(candidates: Compound[], version = "1", unknown: Plot): SpecturmFilter {
        this.un = unknown
        this.candidates = candidates
        this.version = version
        this.baseUrl = conf.database_url +
            "/v" + version +
            "/stage_2"

        return this
    }

    async extract(): Promise<ResultStage2> {
        let currentSpecturms: Specturm[] = []
        let specturms: Specturm[] = []

        for (const c of this.candidates) {
            if (!c?.name) continue
            currentSpecturms = await this.fetchSpecturmMethods(c)
            specturms = specturms.concat(currentSpecturms)
            for (const s of specturms) {
                s.confidence = getConfidence(s.plot, this.un)

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

}