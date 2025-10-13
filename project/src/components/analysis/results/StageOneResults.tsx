import "styles/global.css";
import { Session } from "@/logic/session/session_service.ts";
import { useEffect, useRef, useState } from "preact/hooks";
import type { ResultStage1 } from "@core/models/result_parameters.model.ts";
import { DataSets } from "@/logic/algo.interface.ts";

type Props = { session: Session };

export default function StageOneResults({ session }: Props) {
    let [results, setResults] = useState<ResultStage1 | undefined>();
    const tableRef = useRef(null);

    useEffect(() => {
        if (session === undefined) {
            console.log("No session found!");
            window.location.href = import.meta.env.BASE_URL + "/analysis/new";
            return;
        }

        (async () => {
            let result = await session.getAlgorithmResult();
            let results = result?.data?.result as ResultStage1 | undefined;
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
        })();
    }, []);

    // Hues
    function colorByHue(cell: HTMLElement, hueValue: number | null) {
        if (!hueValue || isNaN(hueValue)) return;
        const hue = parseFloat(hueValue);
        cell.style.backgroundColor = `hsl(${hue}, 70%, 45%)`;
        cell.style.color = "white";
        cell.style.fontWeight = "600";
    }

    useEffect(() => {
        if (tableRef.current == null) return;
        const table = tableRef.current as HTMLTableElement;

        table.querySelectorAll("[data-hue]").forEach((cell) => {
            const hueValue = cell.getAttribute("data-hue");
            if (hueValue === null) return;
            colorByHue(cell, hueValue);
        });
    }, [results, tableRef]);

    return (
        <>
            {results !== undefined ? (
                <>
                {/*<div class="overflow-x-auto mb-3 rounded-2xl bg-white p-5 shadow-lg">
                        DEBUG
                        <br/>
                        results version: {results.version}
                        <br />
                        candidates: {JSON.stringify(results.candidates)}
                        <br />
                        ids: {JSON.stringify(results.ids)}
                    </div>*/}
                    <div class="overflow-x-auto rounded-2xl bg-white p-5 shadow-lg">
                        <table
                            ref={tableRef}
                            className="min-w-full border-collapse text-center"
                        >
                            <thead className="bg-gray-200 text-sm font-semibold text-gray-700 uppercase">
                                <tr>
                                    <th className="border p-3">
                                        Name and Code
                                    </th>
                                    <th className="border p-3">Rf 1</th>
                                    <th className="border p-3">
                                        H° DEV 254 nm
                                    </th>
                                    <th className="border p-3">
                                        H° DEV 366 nm
                                    </th>
                                    <th className="border p-3">
                                        H° VSA 366 nm
                                    </th>
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
                                {results.candidates.count() === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="13"
                                            className="p-6 text-gray-500"
                                        >
                                            No data available. Run the algorithm
                                            to generate results.
                                        </td>
                                    </tr>
                                ) : (
                                    results.candidates
                                        .merge()
                                        .map((compound) => (
                                            <tr className="odd:bg-gray-50">
                                                <td className="border p-3 font-semibold">
                                                    {compound.name ?? compound.id}
                                                </td>
                                                <td className="border p-3">
                                                    {compound.RF}
                                                </td>
                                                <td
                                                    className="border p-3"
                                                    data-hue={
                                                        compound.DEV_254nm
                                                    }
                                                >
                                                    {compound.DEV_254nm}
                                                </td>
                                                <td
                                                    className="border p-3"
                                                    data-hue={
                                                        compound.DEV_366nm
                                                    }
                                                >
                                                    {compound.DEV_366nm}
                                                </td>
                                                <td
                                                    className="border p-3"
                                                    data-hue={
                                                        compound.VSNP_366nm
                                                    }
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
                                                    {compound.FL_Peaks?.[0] ??
                                                        ""}
                                                </td>
                                                <td className="border p-3">
                                                    {compound.FL_Peaks?.[1] ??
                                                        ""}
                                                </td>

                                                {(compound.UV_Peaks ?? [])
                                                    .slice(0, 3)
                                                    .map((peak) => (
                                                        <td className="border p-3">
                                                            {peak}
                                                        </td>
                                                    ))}

                                                <td className="border p-3">
                                                    {compound.FL_Peaks?.[0] ??
                                                        ""}
                                                </td>
                                                <td className="border p-3">
                                                    {compound.FL_Peaks?.[1] ??
                                                        ""}
                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div>Loading results</div>
            )}
        </>
    );
}
