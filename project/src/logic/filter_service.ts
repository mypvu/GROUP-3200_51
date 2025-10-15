/**
 * Static class for easier access to the algorithm code
 */
import type {
    InputParams,
    ResultStage1,
    ResultStage2,
} from "./algo.interface.ts";
import CompoundFilter from "./core/algorithms/filter.ts";
import type { SpecturmFiles } from "./core/models/specturm.model.ts";

export interface FilterResult {
    // Inputs
    input: InputParams;

    // Outputs
    result: ResultStage1 | ResultStage2
}

export default class FilterService {
    /**
     * Run the filtering algorithm on the given sample and datasets.
     * @param input StoredFilterInput from the InputService
     */
    

    public static async run_stage1(input: InputParams): Promise<FilterResult> {
        // Do calculations
        const cf = new CompoundFilter(input);

        // first stage database filtering -> candidates
        const st1_result = await cf.st1()
        
        // Return
        return {
            input: input,
            result: st1_result
        };
    }

    public static async run_stage2(input: InputParams, st1: ResultStage1, files: SpecturmFiles): Promise<FilterResult> {
        const cf = new CompoundFilter(input);

        // second stage specturm overlay -> confidence
        // const st2_result = await cf.st2(st1_result.candidates, input.specturmBuffer)
        const st2_result = await cf.st2(st1.candidates, files)

        return {
            input,
            result: st2_result
        }
    }
}
