import {
    generateRangeParams,
    type RangeParams,
} from "@/logic/utils/range_generate";
import { isCompoundV, type Compound, type Sample } from "@core/models/compund.model";
import DataSets, { type DataSetsID } from "../models/datasets.model";
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

    set(samples: Sample, datasets: DataSets): BasicFilter {
        this. samples = samples
        this.datasets = datasets
        
        return this
    }

    extract(): DataSets {
        this.res = new DataSets([],[],[],[]);
        
        let np1 = this.samples.NP_KDS
        this.bfh.set(np1, Array.from(this.datasets.NK()))
        this.res.NP_KDS = np1 ? this.bfh.applyAllFilters(generateRangeParams(np1)).result() : []

        let vs1 = this.samples.VS_KDS
        this.bfh.set(vs1, Array.from(this.datasets.VK()))
        this.res.VS_KDS = vs1 ? this.bfh.applyAllFilters(generateRangeParams(vs1)).result() : []

        let np2 = this.samples.NP_LDS
        this.bfh.set(np2, Array.from(this.datasets.NL()))
        this.res.NP_LDS = np2 ? this.bfh.applyAllFilters(generateRangeParams(np2)).result() : []

        let vs2 = this.samples.VS_LDS
        this.bfh.set(vs2, Array.from(this.datasets.VL()))
        this.res.VS_LDS = vs2 ? this.bfh.applyAllFilters(generateRangeParams(vs2)).result() : []
        
        return this.res
    }

    simple(): DataSetsID {
        const toIds = (cs: Compound[]): number[] => 
            cs.map(c => (c.id !== undefined ? c.id: NaN))
              .filter(id => !isNaN(id))

        return {
            NK: toIds(this.res.NP_KDS),
            NL: toIds(this.res.NP_LDS),
            VK: toIds(this.res.VS_KDS),
            VL: toIds(this.res.VS_LDS)
        }
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
    applyAllFilters(ranges: RangeParams, T?: boolean): BasicFilterHelper {
        this.res = this.data.filter((compound) => {
            if (this.c.db_label !== compound.db_label) return false

            if (ranges.rf !== undefined
                 && !rf_predicate(ranges.rf)(compound)) return false
            if (ranges.dev254 !== undefined
                 && !DEV_254nm_predicate(ranges.dev254)(compound)) return false
            if (ranges.dev366 !== undefined
                 && !DEV_366nm_predicate(ranges.dev366)(compound)) return false
            if (ranges.vsnp !== undefined
                 && !VSNP_366nm_predicate(ranges.vsnp)(compound)) return false
            if (T !== undefined
                 && ranges.t && !T_predicate(ranges.t)(compound)) return false
            if (ranges.uv_num !== undefined
                 && !UV_Peaks_num_predicate(ranges.uv_num)(compound)) return false
            if (ranges.uv !== undefined
                 && !UV_Peaks_predicate(ranges.uv)(compound)) return false
            if (ranges.fl_num !== undefined
                 && !FL_Peaks_num_predicate(ranges.fl_num)(compound)) return false
            if (ranges.fl !== undefined
                 && !FL_Peaks_predicate(ranges.fl)(compound)) return false
    return true
        })

        return this
    }

    label(label_name: string) :BasicFilterHelper {
        this.res.filter((c: Compound) => {
            return c.db_label === label_name})
        
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
