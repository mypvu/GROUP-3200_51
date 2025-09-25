import type { Sample } from "@/logic/core/models/compund.model";
import type DataSets from "@core/models/datasets.model";
import BasicFilter from "@core/algorithms/BasicFilter";
import { FilterBounds } from "../models/filter.model";
import { OutputParams } from "../models/result_parameters.model";


export default class CompoundFilter {
    private bf: BasicFilter
    // specturm filter

    constructor(
            samples: Sample, 
            datasets: DataSets, 
            threshold: FilterBounds) {
                this.bf = new BasicFilter(samples, datasets)
    }

    extract(): OutputParams {
            

        return []
    }


}