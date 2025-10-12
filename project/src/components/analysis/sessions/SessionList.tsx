import SessionService, { Session } from "@/logic/session/session_service.ts";
import SessionItem from "./SessionItem";
import { useEffect, useState } from "preact/hooks";

export default function SessionList() {
    let [sessions, setSessions] = useState<Session[] | undefined>();

    useEffect(() => {
        const sessionService = new SessionService();
        setSessions(sessionService.getSessions());
    }, []);

    return (
        <>
            {sessions === undefined || sessions.length === 0 ? (
                <p className="text-center text-gray-500">
                    No saved analyses found.
                </p>
            ) : (
                <main className="flex w-full max-w-2xl flex-col gap-4 rounded-2xl bg-white p-8 shadow-lg">
                    {sessions.map((session: Session) => (
                        <SessionItem key={session.id} session={session} />
                    ))}
                </main>
            )}
        </>
    );
}
