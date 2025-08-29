import { generateRangeParams } from "@/logic/utils/range_generate";
import { isCompoundV, type Compound, type Sample } from "@core/models/compund.model";
import DataSets from "@core/models/datasets.model";
import {
  rf_predicate,
  DEV_254nm_predicate,
  DEV_366nm_predicate,
  VSNP_366nm_predicate,
  T_predicate,
  UV_Peaks_predicate,
  FL_Peaks_predicate,
  UV_Peaks_num_predicate,
  FL_Peaks_num_predicate
} from "@core/algorithms/Methods"

enum R{
    MIN,
    MAX
}

export default class BasicFilter {
    private res: DataSets
    private bfh: BasicFilterHelper

    constructor(private samples: Sample, 
                private datasets: DataSets) {
        this.res = new DataSets([],[],[],[])
        this.bfh = new BasicFilterHelper(samples.NP_KDS, Array.from(datasets))
    }

    extract(): DataSets {
        let np1 = this.samples.NP_KDS
        this.bfh.set(np1, Array.from(this.datasets.NK()))
        this.res.NP_KDS = this.bfh.applyAllFilters(generateRangeParams(np1)).result()

        let vs1 = this.samples.VS_KDS
        this.bfh.set(vs1, Array.from(this.datasets.VK()))
        this.res.VS_KDS = this.bfh.applyAllFilters(generateRangeParams(vs1)).result()

        let np2 = this.samples.NP_LDS
        this.bfh.set(np2, Array.from(this.datasets.NL()))
        this.res.NP_LDS = this.bfh.applyAllFilters(generateRangeParams(np2)).result()

        let vs2 = this.samples.VS_LDS
        this.bfh.set(vs2, Array.from(this.datasets.VL()))
        this.res.VS_LDS = this.bfh.applyAllFilters(generateRangeParams(vs2)).result()
        
        return this.res
    }

}

class BasicFilterHelper {
    private res: Compound[]

    constructor(private c: Compound, 
                private data: Compound[]) {
        this.res = []
        this.res = this.data.filter((c: Compound) => this.c.db_label === c.db_label)
    }

    set(c: Compound, data: Compound[]): BasicFilterHelper {
        this.c = c
        this.data = data
        this.res = []

        return this
    }

     // Combined filter method
    applyAllFilters(params: {
        rf?: [number, number],
        dev254?: [number, number],
        dev366?: [number, number],
        vsnp?: [number, number],
        t?: [number, number],
        uv_num?: number,
        uv?: [number, number][],
        fl_num?: number,
        fl?: [number, number][]
    }, T?: boolean): BasicFilterHelper {
        this.res = this.data.filter((compound) => {
            if (this.c.db_label !== compound.db_label) return false
            if (params.rf && !rf_predicate(params.rf)(compound)) return false
            if (params.dev254 && !DEV_254nm_predicate(params.dev254)(compound)) return false
            if (params.dev366 && !DEV_366nm_predicate(params.dev366)(compound)) return false
            if (params.vsnp && !VSNP_366nm_predicate(params.vsnp)(compound)) return false
            if (T && params.t && !T_predicate(params.t)(compound)) return false
            if (params.uv_num && !UV_Peaks_num_predicate(params.uv_num)(compound)) return false
            if (params.uv && !UV_Peaks_predicate(params.uv)(compound)) return false
            if (params.fl_num && !FL_Peaks_num_predicate(params.fl_num)(compound)) return false
            if (params.fl && !FL_Peaks_predicate(params.fl)(compound)) return false

    return true
        })

        return this
    }

    label(label_name: string) :BasicFilterHelper {
        
        return this
    }

    rf(range: [number, number]) :BasicFilterHelper {
        this.res.filter(rf_predicate(range))

        return this
    }

    DEV_254nm(range: [number, number]) :BasicFilterHelper {
        this.res.filter(DEV_254nm_predicate(range))
        
        return this
    }

    DEV_366nm(range: [number, number]) :BasicFilterHelper {
        this.res.filter(DEV_366nm_predicate(range))

        return this
    }

    VSNP_366nm(range: [number, number]) :BasicFilterHelper {
        this.res.filter(VSNP_366nm_predicate(range))

        return this
    }

    UV_Peaks(range: [number, number][]) :BasicFilterHelper {
        this.res.filter(UV_Peaks_predicate(range))

        return this
    }

    FL_Peaks(range: [number, number][]) :BasicFilterHelper {
        this.res.filter(FL_Peaks_predicate(range))

        return this
    }

    T() :BasicFilterHelper {
        if (this.c && !isCompoundV(this.c))
            throw new Error("Program failed :Compund does not have value \"T\" to compare!")
            

        return this
    }

    result(): Compound[] {
        return this.res
    }
}
