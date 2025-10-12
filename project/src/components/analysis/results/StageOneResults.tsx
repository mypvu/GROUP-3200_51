import "styles/global.css";
import SessionService, {
    Session,
    SessionAlgorithmData,
} from "@/logic/session/session_service.ts";
import { useState, useEffect } from "preact/hooks";
import CompoundDetailsEditor from "@/components/analysis/new/details/CompoundDetailsEditor.tsx";
import CompoundHelper from "@/logic/compound_helper.ts";
import type { Compound } from "@/lib/core/models/compunds.ts";
import type { FilterResult } from "@/logic/filter_service.ts";
import type { ResultStage1 } from "@core/models/result_parameters.model.ts";

type Props = { session: Session };

export default function StageOneResults({ session }: Props) {
    let [results, setResults] = useState<ResultStage1 | undefined>();

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

            setResults(results);
        })();
    }, []);

    return (
        <>
            {results !== undefined ? (
                <div class="overflow-x-auto rounded-2xl bg-white shadow-lg">
                    results version: {results.version}

                    <br/>

                    candidates: {JSON.stringify(results.candidates)}

                    <br/>

                    ids: {JSON.stringify(results.ids)}
                </div>
            ) : (
                <div>Loading results</div>
            )}
        </>
    );
}
