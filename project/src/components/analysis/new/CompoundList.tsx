import "styles/global.css";
import SessionService, { Session } from "@/logic/session/session_service.ts";
import CompoundItem from "./CompoundItem";
import { useState } from "preact/hooks";

export default function CompoundList() {
    let sessionService = new SessionService();

    let [session, setSession] = useState<Session | undefined>(
        sessionService.getCurrentSession(),
    );

    if (session === undefined) {
        (async () => {
            setSession(await sessionService.createNewSession());
        })();
    }

    return (
        <>
            {session !== undefined ? (
                <div className="flex flex-col gap-3 lg:col-span-2">
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
