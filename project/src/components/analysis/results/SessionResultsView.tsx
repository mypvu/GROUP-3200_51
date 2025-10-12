import "styles/global.css";
import SessionService, { Session } from "@/logic/session/session_service.ts";
import { useState, useEffect } from "preact/hooks";

export default function StageOneResults() {
    let [session, setSession] = useState<Session | undefined>();

    useEffect(() => {
        // Set the session clientside only
        let newSession = SessionService.getInstance().getCurrentSession();

        if (newSession === undefined) {
            console.log("No session found!");
            window.location.href = import.meta.env.BASE_URL + "/analysis/new";
            return;
        }

        setSession(newSession);
    }, []);

    return (
        <>
            {session !== undefined ? (
                <StageOneResults session={session}></StageOneResults>
            ) : (
                <div>Loading</div>
            )}
        </>
    );
}
