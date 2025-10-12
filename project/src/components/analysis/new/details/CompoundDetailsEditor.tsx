import "./CompoundDetailsEditor.css";
import SessionService, {
    Session,
    SessionAlgorithmData,
} from "@/logic/session/session_service.ts";
import { useEffect, useRef, useState } from "preact/hooks";
import CompoundHelper from "@/logic/compound_helper.ts";
import type { Compound } from "@core/models/compund.model.ts";

type Props = {
    session: Session;
    sessionAlgorithmData: SessionAlgorithmData;
    compoundType: string;
};

export default function CompoundDetailsEditor({
    session,
    sessionAlgorithmData,
    compoundType,
}: Props) {
    const compoundDisplayName =
        CompoundHelper.getTypeDisplayName(compoundType) ?? "Compound";
    const isVsType = CompoundHelper.isVsType(compoundType);

    const [compound, setCompound] = useState<Compound | undefined>();
    const [local, setLocal] = useState<Compound | undefined>(compound);
    let currentlySaving = false;

    useEffect(() => {
        let newCompound =
            sessionAlgorithmData.inputs.getOrCreateCompoundByType(compoundType);

        setCompound(newCompound);

        if (newCompound === undefined) {
            console.log("No compound found!");
            window.location.href = "/analysis/new";
            return;
        }

        setLocal(newCompound);
    }, []);

    function saveCompoundData(data: any) {
        // update the local state
        setLocal(data);

        // update the session data
        if (!currentlySaving) {
            (async () => {
                sessionAlgorithmData.inputs.setCompoundByType(
                    compoundType,
                    data,
                );
                currentlySaving = false;
            })();
        }
    }

    function updateAsNumber<K extends keyof Compound>(
        key: K,
        value: any,
        min: number | undefined = undefined,
        max: number | undefined = undefined,
    ) {
        let valueAsNumber = Number(value);

        if (!isNaN(valueAsNumber)) {
            if (min !== undefined && valueAsNumber < min) {
                valueAsNumber = min;
            }
            if (max !== undefined && valueAsNumber > max) {
                valueAsNumber = max;
            }
        } else {
            valueAsNumber = 0;
        }

        const updated = { ...local, [key]: valueAsNumber };
        saveCompoundData(updated);
    }

    function updateAsArrayCount<K extends keyof Compound>(
        countKey: K,
        arrayKey: K,
        value: any,
    ) {
        let valueAsNumber = Number(value);
        valueAsNumber = isNaN(valueAsNumber) ? 0 : valueAsNumber;
        valueAsNumber = Math.min(5, valueAsNumber);

        // @ts-ignore
        let newArray: number[] = local[arrayKey] ?? [];
        let countDelta = newArray.length - (valueAsNumber - 1);
        // https://stackoverflow.com/a/32054416
        while (--countDelta > 0) {
            newArray.pop();
        }
        while (countDelta++ < 0) {
            newArray.push(0);
        }

        const updated = {
            ...local,
            [countKey]: valueAsNumber,
            [arrayKey]: newArray,
        };
        saveCompoundData(updated);
    }

    function updateAsArrayEntry<K extends keyof Compound>(
        arrayKey: K,
        index: number,
        value: any,
    ) {
        let valueAsNumber = Number(value);
        valueAsNumber = isNaN(valueAsNumber) ? 0 : valueAsNumber;
        // valueAsNumber = Math.min(5, valueAsNumber);

        // @ts-ignore
        let newArray: number[] = local[arrayKey] ?? [];
        newArray[index] = valueAsNumber;

        const updated = {
            ...local,
            [arrayKey]: newArray,
        };
        saveCompoundData(updated);
    }

    if (local === undefined) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="mx-auto max-w-6xl">
                    {/* Left Column: Notes and Save & Exit stacked */}
                    <div className="flex gap-8">
                        {/* Left Side: Notes and Save & Exit */}
                        <div className="flex w-64 flex-col gap-4">
                            {/* Save & Exit Button (Top) */}
                            {/*
                            NOTE:
                            The save and exit button href is in the script below (in connectedCallback)
                        */}
                            <a
                                id="save-and-exit"
                                href={"/analysis/new"}
                                className="btn-hover-effect cursor-pointer rounded-lg bg-gray-500 px-6 py-2 text-center font-semibold text-white hover:bg-gray-600"
                            >
                                Save & Exit
                            </a>

                            {/* Compact Notes Box (Below Save & Exit) */}
                            <div className="rounded-2xl bg-white p-4 shadow-lg">
                                <h3 className="mb-2 text-lg font-semibold text-gray-800">
                                    Notes
                                </h3>
                                <textarea
                                    className="mb-2 h-20 w-full rounded-lg border border-gray-300 p-2 text-sm"
                                    placeholder="Add notes here..."
                                ></textarea>
                                <button className="btn-hover-effect w-full rounded-lg bg-blue-500 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-600">
                                    Save Notes
                                </button>
                            </div>
                        </div>

                        {/* Right Side: Analysis Form Card */}
                        <div className="flex-1">
                            <div className="relative rounded-2xl bg-white p-8 shadow-lg">
                                {/* Header */}
                                <div className="mb-8 text-center">
                                    <h1 className="mb-2 text-3xl font-bold text-gray-800">
                                        New Analysis
                                    </h1>
                                    <h2 className="text-2xl font-semibold text-gray-600">
                                        {compoundDisplayName}
                                    </h2>
                                </div>

                                <div className="space-y-6">
                                    {/* Rf Input */}
                                    <div className="flex items-center justify-center space-x-4">
                                        <label className="w-32 text-right text-lg font-semibold text-gray-700">
                                            Rf:
                                        </label>
                                        <input
                                            id="input-rf"
                                            value={local.RF ?? 0}
                                            onChange={(e) =>
                                                updateAsNumber(
                                                    "RF",
                                                    e.currentTarget.value,
                                                    0,
                                                    1,
                                                )
                                            }
                                            type="text"
                                            className="input-field"
                                            placeholder="______"
                                        />
                                    </div>

                                    {/* RGB Inputs */}
                                    <div className="space-y-4">
                                        {/* RGB 1 */}
                                        <div className="flex items-center justify-center space-x-4">
                                            <label className="w-64 text-right text-lg font-semibold text-gray-700">
                                                RGB 1 (H° DEV 254 nm):
                                            </label>
                                            <input
                                                id="input-rgb1-dev_254nm"
                                                value={local.DEV_254nm}
                                                onChange={(e) =>
                                                    updateAsNumber(
                                                        "DEV_254nm",
                                                        e.currentTarget.value,
                                                    )
                                                }
                                                type="text"
                                                className="input-field"
                                                placeholder="______"
                                            />
                                            {/*<span class="font-semibold">CF1:</span>
                                        <input
                                            id="input-rgb1-dev_254nm-cf1"
                                            type="text"
                                            class="input-field"
                                            placeholder="______"
                                        />*/}
                                        </div>

                                        {/* RGB 2 */}
                                        <div className="flex items-center justify-center space-x-4">
                                            <label className="w-64 text-right text-lg font-semibold text-gray-700">
                                                RGB2 (H° DEV 366 nm):
                                            </label>
                                            <input
                                                id="input-rgb2-dev_366nm"
                                                value={local.DEV_366nm}
                                                onChange={(e) =>
                                                    updateAsNumber(
                                                        "DEV_366nm",
                                                        e.currentTarget.value,
                                                    )
                                                }
                                                type="text"
                                                className="input-field"
                                                placeholder="______"
                                            />
                                            {/*<span class="font-semibold">CF2:</span>
                                        <input
                                            id="input-rgb2-dev_366nm-cf2"
                                            type="text"
                                            class="input-field"
                                            placeholder="______"
                                        />*/}
                                        </div>

                                        {/* RGB 3 */}
                                        <div className="flex items-center justify-center space-x-4">
                                            <label className="w-64 text-right text-lg font-semibold text-gray-700">
                                                RGB3 (H° NP 366 nm):
                                            </label>
                                            <input
                                                id="input-rgb3-vsnp_366nm"
                                                value={local.VSNP_366nm}
                                                onChange={(e) =>
                                                    updateAsNumber(
                                                        "VSNP_366nm",
                                                        e.currentTarget.value,
                                                    )
                                                }
                                                type="text"
                                                className="input-field"
                                                placeholder="______"
                                            />
                                            {/*<span class="font-semibold">CF3:</span>
                                        <input
                                            id="input-rgb1-vsnp_366nm-cf3"
                                            type="text"
                                            class="input-field"
                                            placeholder="______"
                                        />*/}
                                        </div>
                                    </div>

                                    {isVsType ? (
                                        /* T VSA */
                                        <div className="mt-4 flex items-center justify-center space-x-4">
                                            <label className="w-64 text-right text-lg font-semibold text-gray-700">
                                                T VSA (H° and C):
                                            </label>
                                            <input
                                                id="input-t-vsa"
                                                value={local.T ?? 0}
                                                onChange={(e) =>
                                                    updateAsNumber(
                                                        "T",
                                                        e.currentTarget.value,
                                                    )
                                                }
                                                type="text"
                                                className="input-field"
                                                placeholder="______"
                                            />
                                            {/*<span class="font-semibold">CF4:</span>
                                        <input
                                            id="t-vsa-cf4"
                                            type="text"
                                            class="input-field"
                                            placeholder="______"
                                        />*/}
                                        </div>
                                    ) : (
                                        <div />
                                    )}

                                    {/* UV Vis Peaks */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-center space-x-4">
                                            <label className="w-32 text-right text-lg font-semibold text-gray-700">
                                                UV Vis Peaks
                                            </label>
                                            <input
                                                id="input-uv-vis-peaks-count"
                                                value={local.UV_Peaks_num}
                                                onInput={(e) =>
                                                    updateAsArrayCount(
                                                        "UV_Peaks_num",
                                                        "UV_Peaks",
                                                        e.currentTarget.value,
                                                    )
                                                }
                                                type="text"
                                                className="input-field w-20"
                                                placeholder="___"
                                            />
                                            {local.UV_Peaks?.map((v, i) => (
                                                <>
                                                    <span className="font-semibold">
                                                        UV λ.{i + 1}:
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={
                                                            local.UV_Peaks[i] ??
                                                            0
                                                        }
                                                        onInput={(e) =>
                                                            updateAsArrayEntry(
                                                                "UV_Peaks",
                                                                i,
                                                                e.currentTarget
                                                                    .value,
                                                            )
                                                        }
                                                        className="input-field"
                                                        placeholder="___"
                                                    />
                                                </>
                                            ))}
                                        </div>
                                    </div>

                                    {/* FI Peaks */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-center space-x-4">
                                            <label className="w-32 text-right text-lg font-semibold text-gray-700">
                                                FI Peaks
                                            </label>
                                            <input
                                                id="input-fl-peaks-count"
                                                value={local.FL_Peaks_num}
                                                onInput={(e) =>
                                                    updateAsArrayCount(
                                                        "FL_Peaks_num",
                                                        "FL_Peaks",
                                                        e.currentTarget.value,
                                                    )
                                                }
                                                type="text"
                                                className="input-field w-20"
                                                placeholder="___"
                                            />
                                            {local.FL_Peaks?.map((v, i) => (
                                                <>
                                                    <span className="font-semibold">
                                                        FI λ.1:
                                                    </span>
                                                    <input
                                                        id="fi-d1"
                                                        value={
                                                            local.FL_Peaks[i] ??
                                                            0
                                                        }
                                                        onInput={(e) =>
                                                            updateAsArrayEntry(
                                                                "FL_Peaks",
                                                                i,
                                                                e.currentTarget
                                                                    .value,
                                                            )
                                                        }
                                                        type="text"
                                                        className="input-field"
                                                        placeholder="___"
                                                    />
                                                </>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Centered Arrow at Bottom */}
                                    <div className="mt-8 text-center">
                                        <a
                                            href="/analysis/new"
                                            title="Complete Analysis"
                                            className="arrow-hover inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100"
                                        >
                                            <span className="text-2xl font-bold text-gray-600">
                                                →
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
