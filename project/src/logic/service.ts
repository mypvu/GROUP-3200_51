/**
 * Static class for easier access to the algorithm code
 */
import { persistentAtom } from "@nanostores/persistent";
import type { InputParams, ResultStage1, ResultStage2 } from "./algo.interface.ts";
import CompoundFilter from "./core/algorithms/filter.ts";

interface FilterResult {
    // Inputs
    input: InputParams

    // Outputs
    result: {
        stage1?: ResultStage1,
        stage2?: ResultStage2
    },

}

const persistentResultStorage = persistentAtom<FilterResult[]>("results", [], {
    encode: JSON.stringify,
    decode: JSON.parse,
});

export default class FilterService {
    /**
     * Get the previous filtering results from local storage.
     */
    public static async getAllPreviousResults(): Promise<FilterResult[]> {
        return persistentResultStorage.get();
    }

    /**
     * Run the filtering algorithm on the given sample and datasets.
     * This method will also save the result to local storage.
     * @param sample TODO
     * @param datasets TODO
     */
    public static async run(
        input: InputParams
    ): Promise<FilterResult> {
        // Do calculations
        const cf = new CompoundFilter(input)

        // Create a FilterResult
        let result: FilterResult = {
            input: input,

            result: {
                stage1: await cf.st1(),
                stage2: undefined
            }
        };

        // Save the result to storage
        // TODO: do we need to give the results a name or an ID?
        persistentResultStorage.set([...persistentResultStorage.get(), result]);

        // Return
        return result;
    }
}
