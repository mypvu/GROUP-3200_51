import "@/styles/global.css";
import SessionService, { Session } from "@/logic/session/session_service.ts";
import CompoundItem from "@/components/analysis/new/CompoundItem";
import { useEffect, useState } from "preact/hooks";
import FilterService from "@/logic/filter_service.ts";
import { navigate } from "astro:transitions/client";

// NOTE
// This component is only usable for debugging at the moment

async function runAlgorithm() {
    let sessionService = SessionService.getInstance();
    let session = sessionService.getCurrentSession();
    const sessionAlgorithmData = await session.getAlgorithmData();

    // run algorithm
    console.log("running...");
    let result = await FilterService.run_stage1(sessionAlgorithmData.inputs);
    console.log("result: ", result);

    // save to session data
    console.log("preparing to save...");
    let sessionAlgorithmResult = await session.getAlgorithmResult();
    sessionAlgorithmResult.data = result;

    console.log("saving result...");
    await sessionAlgorithmResult.save();

    console.log(result);

    navigate(import.meta.env.BASE_URL + "/analysis/results");
}

export default function AnalysisNewRunButton() {
    let sessionService = SessionService.getInstance();

    let [ready, setReady] = useState<Boolean | undefined>();

    // TODO: clean up
    async function canComplete(): Promise<Boolean> {
        let session = sessionService.getCurrentSession();
        if (session === undefined) return false;
        const sessionAlgorithmData = await session.getAlgorithmData();
        if (sessionAlgorithmData === undefined) return false;
        if (sessionAlgorithmData.inputs === undefined) return false;
        return sessionAlgorithmData.inputs.allCompoundsComplete();
    }

    useEffect(() => {
        (async () => {
            setReady(await canComplete());
        })();
    }, []);

    return (
        <>
            <div class="flex flex-row items-center gap-3">
                <a
                    onClick={() => {
                        runAlgorithm();
                    }}
                    className={
                        ready
                            ? "btn-hover-effect inline-block cursor-pointer rounded-lg bg-gray-500 px-6 py-2 font-semibold text-white hover:bg-gray-600"
                            : "btn-hover-effect inline-block cursor-pointer rounded-lg bg-gray-500 px-6 py-2 font-semibold text-white hover:bg-gray-600"
                    }
                >
                    Run Analysis
                </a>

            </div>
        </>
    );
}
