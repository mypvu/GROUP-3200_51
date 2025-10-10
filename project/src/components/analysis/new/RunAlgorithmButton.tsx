import "styles/global.css";
import SessionService, { Session } from "@/logic/session/session_service.ts";
import CompoundItem from "./CompoundItem";
import { useEffect, useState } from "preact/hooks";
import FilterService from "@/logic/filter_service.ts";

// NOTE
// This component is only usable for debugging at the moment

async function runAlgorithm(session: Session, sessionService: SessionService) {
    const sessionAlgorithmData = await session.getAlgorithmData();

    // run algorithm
    console.log("running...");
    let result = await FilterService.run(sessionAlgorithmData.inputs);
    console.log("result: ", result);

    // save to session data
    console.log("preparing to save...");
    let sessionAlgorithmResult = await session.getAlgorithmResult();
    sessionAlgorithmResult.data = result;

    console.log("saving result...");
    await sessionAlgorithmResult.save();

    console.log(result);
}

export default function RunAlgorithmButton() {
    let sessionService = new SessionService();

    let [session, setSession] = useState<Session | undefined>(
        sessionService.getCurrentSession(),
    );

    let [ready, setReady] = useState<Boolean | undefined>();

    // TODO: clean up
    async function canComplete(): Promise<Boolean> {
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
            {ready !== undefined ? (
                ready ? (
                    <div onClick={() => runAlgorithm(session, sessionService)} className="flex cursor-pointer flex-col gap-3 bg-green-500 p-4 lg:col-span-2">
                        DEBUG BUTTON: ready to run algorithm, click here
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 lg:col-span-2">
                        DEBUG BUTTON: not ready to run algorithm
                    </div>
                )
            ) : (
                <div>loading...</div>
            )}
        </>
    );
}
