import "styles/global.css";
import { Session } from "@/logic/session/session_service.ts";
import { useEffect, useRef, useState } from "preact/hooks";
import type { ResultStage1 } from "@core/models/result_parameters.model.ts";
import { DataSets } from "@/logic/algo.interface.ts";
import type { Compound } from "@/logic/algo.interface.ts";
import type { SessionAlgorithmInputs } from "@/logic/session/algorithm_input.ts";

type Props = { session: Session };

export default function StageOneResults({ session }: Props) {
    let [results, setResults] = useState<ResultStage1 | undefined>();
    let [inputs, setInputs] = useState<SessionAlgorithmInputs | undefined>();
    const tableRefs = useRef<(HTMLTableElement | null)[]>([]);

    useEffect(() => {
        if (session === undefined) {
            console.log("No session found!");
            window.location.href = import.meta.env.BASE_URL + "/analysis/new";
            return;
        }

        (async () => {
            // Load algorithm results
            let results = (await session.getAlgorithmResult())?.data?.resultForStageOne;
            if (results === undefined) {
                console.log("No data found!");
                window.location.href =
                    import.meta.env.BASE_URL + "/analysis/new";
                return;
            }

            results.candidates = Object.assign(
                new DataSets(),
                results.candidates,
            );

            setResults(results);

            // Load algorithm inputs (user's unknown compound values)
            let algorithmData = await session.getAlgorithmData();
            setInputs(algorithmData.inputs);
        })();
    }, []);

    // Hues
    function colorByHue(cell: HTMLElement, hueValue: number | null) {
        if (!hueValue || isNaN(hueValue)) return;
        const hue = parseFloat(hueValue.toString());
        cell.style.backgroundColor = `hsl(${hue}, 70%, 45%)`;
        cell.style.color = "white";
        cell.style.fontWeight = "600";
    }

    useEffect(() => {
        tableRefs.current.forEach((table) => {
            if (table == null) return;
            
            table.querySelectorAll("[data-hue]").forEach((cell) => {
                const hueValue = cell.getAttribute("data-hue");
                if (hueValue === null || hueValue === "") return;
                colorByHue(cell as HTMLElement, parseFloat(hueValue));
            });
        });
    }, [results]);

    // Function to render a table for a specific experiment type
    const renderTable = (
        title: string,
        compounds: Compound[],
        unknownCompound: Compound | undefined,
        index: number
    ) => (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
            <div className="overflow-x-auto rounded-2xl bg-white p-5 shadow-lg">
                <table
                    ref={(el) => (tableRefs.current[index] = el)}
                    className="min-w-full border-collapse text-center"
                >
                    <thead className="bg-gray-200 text-sm font-semibold text-gray-700 uppercase">
                        <tr>
                            <th className="border p-3">Name</th>
                            <th className="border p-3">Rf 1</th>
                            <th className="border p-3">H° DEV 254 nm</th>
                            <th className="border p-3">H° DEV 366 nm</th>
                            <th className="border p-3">H° VSA 366 nm</th>
                            <th className="border p-3">H° T VSA</th>
                            <th className="border p-3">FI DEV λ</th>
                            <th className="border p-3">FI DEV λ m</th>
                            <th className="border p-3">UV DEV λ₁</th>
                            <th className="border p-3">UV DEV λ₂</th>
                            <th className="border p-3">UV DEV λ₃</th>
                            <th className="border p-3">FI VS λ</th>
                            <th className="border p-3">UV VS λ</th>
                        </tr>
                    </thead>

                    <tbody className="text-gray-800">
                        {/* Unknown Compound Input Row */}
                        {unknownCompound && (
                            <tr className="bg-blue-100 font-semibold border-b-2 border-blue-300">
                                <td className="border p-3 text-blue-900">
                                    Unknown
                                </td>
                                <td className="border p-3">
                                    {unknownCompound.RF}
                                </td>
                                <td
                                    className="border p-3"
                                    data-hue={unknownCompound.DEV_254nm ?? ""}
                                >
                                    {unknownCompound.DEV_254nm}
                                </td>
                                <td
                                    className="border p-3"
                                    data-hue={unknownCompound.DEV_366nm ?? ""}
                                >
                                    {unknownCompound.DEV_366nm}
                                </td>
                                <td
                                    className="border p-3"
                                    data-hue={unknownCompound.VSNP_366nm ?? ""}
                                >
                                    {unknownCompound.VSNP_366nm}
                                </td>
                                <td
                                    className="border p-3"
                                    data-hue={unknownCompound.T ?? ""}
                                >
                                    {unknownCompound.T ?? ""}
                                </td>

                                <td className="border p-3">
                                    {unknownCompound.FL_Peaks?.[0] ?? ""}
                                </td>
                                <td className="border p-3">
                                    {unknownCompound.FL_Peaks?.[1] ?? ""}
                                </td>

                                {(unknownCompound.UV_Peaks ?? [])
                                    .slice(0, 3)
                                    .map((peak) => (
                                        <td className="border p-3">{peak}</td>
                                    ))}

                                <td className="border p-3">
                                    {unknownCompound.FL_Peaks?.[0] ?? ""}
                                </td>
                                <td className="border p-3">
                                    {unknownCompound.FL_Peaks?.[1] ?? ""}
                                </td>
                            </tr>
                        )}

                        {/* Matched Compounds */}
                        {compounds.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={13}
                                    className="p-6 text-gray-500"
                                >
                                    No matches found for this experiment type.
                                </td>
                            </tr>
                        ) : (
                            compounds.map((compound) => (
                                <tr className="odd:bg-gray-50">
                                    <td className="border p-3 font-semibold">
                                        {compound.name ?? compound.id}
                                    </td>
                                    <td className="border p-3">
                                        {compound.RF}
                                    </td>
                                    <td
                                        className="border p-3"
                                        data-hue={compound.DEV_254nm ?? ""}
                                    >
                                        {compound.DEV_254nm}
                                    </td>
                                    <td
                                        className="border p-3"
                                        data-hue={compound.DEV_366nm ?? ""}
                                    >
                                        {compound.DEV_366nm}
                                    </td>
                                    <td
                                        className="border p-3"
                                        data-hue={compound.VSNP_366nm ?? ""}
                                    >
                                        {compound.VSNP_366nm}
                                    </td>
                                    <td
                                        className="border p-3"
                                        data-hue={compound.T ?? ""}
                                    >
                                        {compound.T ?? ""}
                                    </td>

                                    <td className="border p-3">
                                        {compound.FL_Peaks?.[0] ?? ""}
                                    </td>
                                    <td className="border p-3">
                                        {compound.FL_Peaks?.[1] ?? ""}
                                    </td>

                                    {(compound.UV_Peaks ?? [])
                                        .slice(0, 3)
                                        .map((peak) => (
                                            <td className="border p-3">
                                                {peak}
                                            </td>
                                        ))}

                                    <td className="border p-3">
                                        {compound.FL_Peaks?.[0] ?? ""}
                                    </td>
                                    <td className="border p-3">
                                        {compound.FL_Peaks?.[1] ?? ""}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <>
            {results !== undefined && inputs !== undefined ? (
                <div>
                    {renderTable(
                        "KDS NP Candidates:", 
                        results.candidates.NP_KDS, 
                        inputs.samples.NP_KDS,
                        0
                    )}
                    {renderTable(
                        "LDS NP Candidates:", 
                        results.candidates.NP_LDS, 
                        inputs.samples.NP_LDS,
                        1
                    )}
                    {renderTable(
                        "KDS VS Candidates:", 
                        results.candidates.VS_KDS, 
                        inputs.samples.VS_KDS,
                        2
                    )}
                    {renderTable(
                        "LDS VS Candidates:", 
                        results.candidates.VS_LDS, 
                        inputs.samples.VS_LDS,
                        3
                    )}
                </div>
            ) : (
                <div>Loading results</div>
            )}
        </>
    );
}