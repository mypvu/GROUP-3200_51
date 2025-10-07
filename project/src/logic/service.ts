/**
 * Static class for easier access to the algorithm code
 */
import type { Sample } from "@core/models/compund.model.ts";
import type DataSets from "@core/models/datasets.model.ts";
import type { DataSetsID } from "@core/models/datasets.model.ts";
import { persistentAtom } from "@nanostores/persistent";
import BasicFilter from "@core/algorithms/BasicFilter.ts";
import { ds, sample as i_sample } from "./utils/csvLoader.ts";

interface FilterResult {
    // Inputs
    sample: Sample;

    // Outputs
    extracted: DataSets;
    simple: DataSetsID;
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
        sample: Sample,
        datasets: DataSets,
    ): Promise<FilterResult> {
        // Do calculations
        const bf = new BasicFilter(i_sample, ds);
        bf.set(sample, datasets).extract();

        // Create a FilterResult
        let result: FilterResult = {
            sample: sample,

            extracted: bf.extract(),
            simple: bf.simple(),
        };

        // Save the result to storage
        // TODO: do we need to give the results a name or an ID?
        persistentResultStorage.set([...persistentResultStorage.get(), result]);

        // Return
        return result;
    }
}
