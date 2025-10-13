import "styles/global.css";
import SessionService, { Session } from "@/logic/session/session_service.ts";
import CompoundItem from "@/components/analysis/new/CompoundItem";
import { useEffect, useState } from "preact/hooks";

export default function AnalysisNewCompoundList() {
    let [session, setSession] = useState<Session | undefined>();

    useEffect(() => {
        const sessionService = SessionService.getInstance();
        let currentSession = sessionService.getCurrentSession();
        if (currentSession === undefined) {
            (async () => {
                setSession(await sessionService.createNewSession());
            })();
        } else {
            setSession(currentSession);
        }
    }, []);

    return (
        <>
            {session !== undefined ? (
                <div className="flex flex-col gap-3 transition-opacity delay-150 ease-in-out">
                    <CompoundItem
                        session={session}
                        compoundType="kds-np"
                    ></CompoundItem>
                    <CompoundItem
                        session={session}
                        compoundType="lds-np"
                    ></CompoundItem>
                    <CompoundItem
                        session={session}
                        compoundType="kds-vs"
                    ></CompoundItem>
                    <CompoundItem
                        session={session}
                        compoundType="lds-vs"
                    ></CompoundItem>
                </div>
            ) : (
                <div>Loading</div>
            )}
        </>
    );
}
