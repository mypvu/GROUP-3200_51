import { defaultCompundFilter as THRE } from "../../utils/rw";
import type { Compound, CompoundA, CompoundB } from "../models/compund.model";
import DataSets from "../models/datasets.model";

export default class SimpleFilter {

    constructor(private data: DataSets) {
        
    }

    label(label_name: string) :SimpleFilter {
        

        return this
    }

    rf(min: number, max: number) :SimpleFilter {

        return this
    }

    DEV_254nm() :SimpleFilter {

        return this
    }

    DEV_366nm() :SimpleFilter {

        return this
    }

    VSNP_366nm() :SimpleFilter {

        return this
    }

    UV_Peaks() :SimpleFilter {

        return this
    }

    FL_Peaks() :SimpleFilter {

        return this
    }

    T() :SimpleFilter {

        return this
    }

}