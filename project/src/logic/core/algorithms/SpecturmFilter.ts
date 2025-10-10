import type { Compound } from "../models/compund.model";
import type { ResultStage2 } from "../models/result_parameters.model";
import conf from "../../config/conf.json"
import type { Version } from "../models/version.model";
import type Specturm from "../models/specturm.model";
import { Stage2Methods, type MethodsType } from "../models/specturm.model";
import { fetchAndParseXY } from "@/logic/utils/fetch_excel_st2";

export default class SpecturmFilter {
    public candidates: Compound[]
    public un: Specturm
    private baseUrl: string
    private version: Version

    constructor(unknown: Specturm, candidates: Compound[], version = "1") {
        this.candidates = candidates
        this.version = version
        this.baseUrl = conf.database_url +
            "/v" + version +
            "/stage_2"
    }

    set(unknown: Specturm, candidates: Compound[], version = "1") {
        this.candidates = candidates
        this.un = unknown
        this.version = version
        this.baseUrl = conf.database_url +
            "/v" + version +
            "/stage_2"
    }

    async extract(): Promise<ResultStage2> {

        const candidates: Compound[] = this.candidates
        const results: Specturm[] = []

        const 
        for (const c of this.candidates) {
            if (!c?.name) continue
            allJobs.push(this.fetchSpecturmMethods(c))
        }

        return {
            specturms: [],
            version: this.version
        }
    }

    private makeUrl(method: string, compoundName: string): URL {
        return new URL(this.baseUrl + "/" + method + "/" + compoundName)
    }

    public compare(candidate: Specturm, target: Specturm): boolean {

        return false
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
            if (s.status === "fulfilled" && s.value) results.push(s.value)
        }

        return results
    }

    /**
     * Fetch a single spectrum for a compound/method via the provided helper.
     * Assumes fetchAndParseXY(url) returns { Xs: number[], Ys: number[] }.
     */
    private async fetchSpecturm(compound: Compound, method: MethodsType): Promise<Specturm> {
        const name = compound?.name

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