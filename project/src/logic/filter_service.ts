/**
 * Static class for easier access to the algorithm code
 */
import type {
    InputParams,
    ResultStage1,
    ResultStage2,
} from "./algo.interface.ts";
import CompoundFilter from "./core/algorithms/filter.ts";

export interface FilterResult {
    // Inputs
    input: InputParams;

    // Outputs
    result: {
        stage1?: ResultStage1;
        stage2?: ResultStage2;
    };
}

export default class FilterService {
    /**
     * Run the filtering algorithm on the given sample and datasets.
     * @param input StoredFilterInput from the InputService
     */
    public static async run(input: InputParams): Promise<FilterResult> {
        // Do calculations
        const cf = new CompoundFilter(input);

        // first stage database filtering -> candidates
        const st1_result = await cf.st1()
        
        // second stage specturm overlay -> confidence
        const st2_result = await cf.st2(st1_result.candidates, input.specturmBuffer)

        // Return
        return {
            input: input,

            result: {
                stage1: st1_result,
                stage2: st2_result,
            },
        };
    }
}
