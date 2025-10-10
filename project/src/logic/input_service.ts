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
            samples: {
                NP_KDS: {
                    db_label: "NK",
                    RF: 0,
                    DEV_254nm: 0,
                    DEV_366nm: 0,
                    VSNP_366nm: 0,
                    UV_Peaks_num: 0,
                    UV_Peaks: [],
                    FL_Peaks_num: 0,
                    FL_Peaks: [],
                },
                NP_LDS: {
                    db_label: "NL",
                    RF: 0,
                    DEV_254nm: 0,
                    DEV_366nm: 0,
                    VSNP_366nm: 0,
                    UV_Peaks_num: 0,
                    UV_Peaks: [],
                    FL_Peaks_num: 0,
                    FL_Peaks: [],
                },
                VS_KDS: {
                    db_label: "VK",
                    RF: 0,
                    DEV_254nm: 0,
                    DEV_366nm: 0,
                    VSNP_366nm: 0,
                    UV_Peaks_num: 0,
                    UV_Peaks: [],
                    FL_Peaks_num: 0,
                    FL_Peaks: [],
                    T: null,
                },
                VS_LDS: {
                    db_label: "VL",
                    RF: 0,
                    DEV_254nm: 0,
                    DEV_366nm: 0,
                    VSNP_366nm: 0,
                    UV_Peaks_num: 0,
                    UV_Peaks: [],
                    FL_Peaks_num: 0,
                    FL_Peaks: [],
                    T: null,
                },
            },
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
