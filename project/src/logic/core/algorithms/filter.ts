import BasicFilter from "@core/algorithms/BasicFilter";
import type { FilterBounds } from "../models/filter.model";
import type { ResultStage1, ResultStage2 } from "../models/result_parameters.model";
import type { InputParams } from "../models/search_parameters.model";
import { fetch_dataset } from "@/logic/utils/fetch_excel_st1";
import conf from "../../config/conf.json"
import type DataSets from "../models/datasets.model";

export default class CompoundFilter {
    private bf: BasicFilter
    private input: InputParams
    // specturm filter

    constructor(
            input: InputParams,
            threshold?: FilterBounds) {
                this.input = input
                this.bf = new BasicFilter(input.samples)
    }
  
    async st1(ver = this.input.version): Promise<ResultStage1> {
        // load remote database base on manifest
        const ds = await fetch_dataset(new URL(conf.database_url +"/v" + ver + "/stage_1"))

        // set the input data and sample
        this.bf.set(this.input.samples,ds)

        // extract result from sample provided
        const res_ds = this.bf.extract()

        return {
            ids: res_ds.ids(),
            compounds: res_ds,
            version: ver
        }
    }

    async st2(candidates: DataSets): Promise<ResultStage2> {
        

        return {
            version: ver
        }
    }


}