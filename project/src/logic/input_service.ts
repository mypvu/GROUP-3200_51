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

/**
 * Wrapper for InputParams that writes the values to local storage.
 */
export class StoredFilterInput {
    private _value: InputParams;

    constructor(value: InputParams) {
        this._value = value;
    }

    public get value(): InputParams {
        return this._value;
    }

    public set value(newValue: InputParams) {
        persistentInputStorage.set(newValue);
        this._value = newValue;
    }
}

export default class InputService {
    /**
     * Is the user already working on an input?
     */
    public static async hasSavedInput(): Promise<Boolean> {
        return persistentInputStorage.get() !== undefined;
    }

    public static async createInput(
        params: InputParams,
    ): Promise<StoredFilterInput> {
        return new StoredFilterInput(params);
    }

    public static async getInput(): Promise<StoredFilterInput> {
        if (persistentInputStorage.get() === undefined) {
            throw new Error("getInput() called but no stored input exists");
        }
        return new StoredFilterInput(persistentInputStorage.get()!);
    }
}
