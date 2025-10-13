import "styles/global.css";
import SessionService, {
    Session,
    SessionData,
} from "@/logic/session/session_service.ts";
import { useEffect, useState } from "preact/hooks";
import SessionNotes from "@/components/analysis/notes/SessionNotes.tsx";

export default function AnalysisNewNotes() {
    let [sessionNotes, setSessionNotes] = useState<
        SessionData<string> | undefined
    >();

    useEffect(() => {
        (async () => {
            const sessionService = SessionService.getInstance();
            let currentSession = sessionService.getCurrentSession();
            setSessionNotes(await currentSession?.getSessionNotes());
        })();
    }, []);

    return (
        <>
            {sessionNotes !== undefined ? (
                <SessionNotes
                    session={SessionService.getInstance().getCurrentSession()!}
                    storage={sessionNotes}
                ></SessionNotes>
            ) : (
                <div>Loading</div>
            )}
        </>
    );
}
