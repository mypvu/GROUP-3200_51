import "styles/global.css";
import SessionService, { Session } from "@/logic/session/session_service.ts";
import { useState, useEffect } from "preact/hooks";
import CompoundDetailsEditor from "@/components/analysis/new/details/CompoundDetailsEditor.tsx";
import CompoundHelper from "@/logic/compound_helper.ts";
import type { Compound } from "@/lib/core/models/compunds.ts";

type Props = { compoundType: string };

export default function CompoundDetailsView({ compoundType }: Props) {
    let sessionService = new SessionService();

    let [session, setSession] = useState<Session | undefined>(
        sessionService.getCurrentSession(),
    );

    let [sessionAlgorithmData, setSessionAlgorithmData] = useState<
        Compound | undefined
    >();

    if (session === undefined) {
        console.log("No session found!");
        location.href = "/analysis/new";
        return <></>;
    }

    useEffect(() => {
        (async () => {
            setSessionAlgorithmData(await session.getAlgorithmData());
        })();
    }, []);

    return (
        <>
            {sessionAlgorithmData !== undefined ? (
                <CompoundDetailsEditor
                    session={session}
                    sessionAlgorithmData={sessionAlgorithmData}
                    compoundType={compoundType}
                ></CompoundDetailsEditor>
            ) : (
                <div>Loading</div>
            )}
        </>
    );
}
