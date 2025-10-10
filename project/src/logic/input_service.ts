import { persistentAtom } from "@nanostores/persistent";
import type { InputParams } from "@core/models/search_parameters.model.ts";

const persistentInputStorage = persistentAtom<InputParams | undefined>(
    "input",
    undefined,
    {
        encode: JSON.stringify,
        decode: JSON.parse,
    },
);

export default class InputService {
    /**
     * Is the user already working on an input?
     */
    public static async hasSavedInput(): Promise<Boolean> {
        return persistentInputStorage.get() !== undefined;
    }

    public static async createEmptyInput(): Promise<InputParams> {
        return {
            version: "",
            samples: {},
        };
    }

    public static async getOrCreateInput(): Promise<InputParams> {
        if (persistentInputStorage.get() === undefined) {
            return this.createEmptyInput();
        }
        return persistentInputStorage.get()!;
    }

    public static async getInput(): Promise<InputParams | undefined> {
        return persistentInputStorage.get()!;
    }

    public static async saveInput(input: InputParams): Promise<void> {
        persistentInputStorage.set(input);
    }
}
