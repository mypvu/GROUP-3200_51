import "styles/global.css";
import SessionService, {
    Session,
    SessionAlgorithmData,
} from "@/logic/session/session_service.ts";
import { useState, useEffect } from "preact/hooks";
import CompoundDetailsEditor from "@/components/analysis/new/details/CompoundDetailsEditor.tsx";
import CompoundHelper from "@/logic/compound_helper.ts";
import type { Compound } from "@/lib/core/models/compunds.ts";
import { navigate } from "astro:transitions/client";

type Props = { compoundType: string };

export default function AnalysisNewDetailsView({ compoundType }: Props) {
    let [sessionAlgorithmData, setSessionAlgorithmData] = useState<
        SessionAlgorithmData | undefined
    >();

    let session: Session | undefined = undefined;

    useEffect(() => {
        // Set the session clientside only
        session = SessionService.getInstance().getCurrentSession();

        if (session === undefined) {
            console.log("No session found!");
            navigate(import.meta.env.BASE_URL + "/analysis/new");
            return;
        }

        (async () => {
            setSessionAlgorithmData(await session.getAlgorithmData());
        })();
    }, []);

    return (
        <>
            {sessionAlgorithmData !== undefined ? (
                <CompoundDetailsEditor
                    session={session!}
                    sessionAlgorithmData={sessionAlgorithmData}
                    compoundType={compoundType}
                ></CompoundDetailsEditor>
            ) : (
                <div>Loading</div>
            )}
        </>
    );
}
