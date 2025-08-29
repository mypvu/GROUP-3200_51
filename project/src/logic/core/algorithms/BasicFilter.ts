import { generateRangeParams } from "../../utils/range_generate";
import { isCompoundB, type Compound, type Sample } from "../models/compound.model";
import DataSets from "../models/datasets.model";
import { DEV_254nm_filter, DEV_366nm_filter, FL_Peaks_filter, rf_filter, UV_Peaks_filter, VSNP_366nm_filter, T_filter, UV_Peaks_num_filter, FL_Peaks_num_filter} from "./Methods";

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
        this.bfh = new BasicFilterHelper(samples.NP1, Array.from(datasets))
    }

    extract(): DataSets {
        let np1 = this.samples.NP1
        this.bfh.set(np1, Array.from(this.datasets.NP1()))
        this.res.C_NP1 = this.bfh.applyAllFilters(generateRangeParams(np1)).result()

        let vs1 = this.samples.VS1
        this.bfh.set(vs1, Array.from(this.datasets.VS1()))
        this.res.C_VS1 = this.bfh.applyAllFilters(generateRangeParams(vs1)).result()

        let np2 = this.samples.NP2
        this.bfh.set(np2, Array.from(this.datasets.NP2()))
        this.res.C_NP2 = this.bfh.applyAllFilters(generateRangeParams(np2)).result()

        let vs2 = this.samples.VS2
        this.bfh.set(vs2, Array.from(this.datasets.VS2()))
        this.res.C_VS2 = this.bfh.applyAllFilters(generateRangeParams(vs2)).result()
        
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
    }): BasicFilterHelper {
        this.res = this.data.filter((compound) => {
            if (this.c.db_label !== compound.db_label) return false
            if (params.rf && !rf_filter(params.rf)(compound)) return false
            if (params.dev254 && !DEV_254nm_filter(params.dev254)(compound)) return false
            if (params.dev366 && !DEV_366nm_filter(params.dev366)(compound)) return false
            if (params.vsnp && !VSNP_366nm_filter(params.vsnp)(compound)) return false
            //if (params.t && !T_filter(params.t)(compound)) return false;
            if (params.uv_num && !UV_Peaks_num_filter(params.uv_num)(compound)) return false
            if (params.uv && !UV_Peaks_filter(params.uv)(compound)) return false
    
            if (params.fl_num && !FL_Peaks_num_filter(params.fl_num)(compound)) return false
            if (params.fl && !FL_Peaks_filter(params.fl)(compound)) return false

            return true
        })

        return this
    }

    label(label_name: string) :BasicFilterHelper {
        
        return this
    }

    rf(range: [number, number]) :BasicFilterHelper {
        this.res.filter(rf_filter(range))

        return this
    }

    DEV_254nm(range: [number, number]) :BasicFilterHelper {
        this.res.filter(DEV_254nm_filter(range))
        
        return this
    }

    DEV_366nm(range: [number, number]) :BasicFilterHelper {
        this.res.filter(DEV_366nm_filter(range))

        return this
    }

    VSNP_366nm(range: [number, number]) :BasicFilterHelper {
        this.res.filter(VSNP_366nm_filter(range))

        return this
    }

    UV_Peaks(range: [number, number][]) :BasicFilterHelper {
        this.res.filter(UV_Peaks_filter(range))

        return this
    }

    FL_Peaks(range: [number, number][]) :BasicFilterHelper {
        this.res.filter(FL_Peaks_filter(range))

        return this
    }

    T() :BasicFilterHelper {
        if (this.c && !isCompoundB(this.c))
            throw new Error("Program failed :Compund does not have value \"T\" to compare!")
            

        return this
    }

    result(): Compound[] {
        return this.res
    }
}
