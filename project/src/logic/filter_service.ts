/**
 * Static class for easier access to the algorithm code
 */
import { persistentAtom } from "@nanostores/persistent";
import type {
    InputParams,
    ResultStage1,
    ResultStage2,
} from "./algo.interface.ts";
import CompoundFilter from "./core/algorithms/filter.ts";
import type { StoredFilterInput } from "@/logic/input_service.ts";

interface FilterResult {
    // Inputs
    input: InputParams;

    // Outputs
    result: {
        stage1?: ResultStage1;
        stage2?: ResultStage2;
    };
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
     * @param input StoredFilterInput from the InputService
     */
    public static async run(input: StoredFilterInput): Promise<FilterResult> {
        // Do calculations
        const cf = new CompoundFilter(input.value);

        // Create a FilterResult
        let result: FilterResult = {
            input: input.value,

            result: {
                stage1: await cf.st1(),
                stage2: undefined,
            },
        };

        // Save the result to storage
        // TODO: do we need to give the results a name or an ID?
        persistentResultStorage.set([...persistentResultStorage.get(), result]);

        // Return
        return result;
    }
}
