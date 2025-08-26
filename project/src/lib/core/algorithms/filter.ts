import type { CompundFilterInterface } from "$lib/utils/rw";
import type { Compound, CompoundA, CompoundB, Sample } from "../models/compund.model";
import type DataSets from "../models/datasets.model";
import BasicFilter from "./BasicFilter";


export default class Filter {
    private bf: BasicFilter
    // specturm filter

    constructor(
            samples: Sample, 
            datasets: DataSets, 
            default_value: CompundFilterInterface) {
                this.bf = new BasicFilter(samples, datasets)
    }

    extract(): DataSets {
            
    }


}