import SessionService, { Session } from "@/logic/session_service.ts";
import SessionItem from "./SessionItem";

export default function SessionList() {
    let sessionService = new SessionService();

    return (
        <>
            {!sessionService.hasAnySessions() ? (
                <p className="text-center text-gray-500">
                    No saved analyses found.
                </p>
            ) : (
                <main className="flex w-full max-w-2xl flex-col gap-4 rounded-2xl bg-white p-8 shadow-lg">
                    {sessionService.getSessions().map((session: Session) => (
                        <SessionItem
                            key={session.id}
                            session={session}
                            sessionService={sessionService}
                        />
                    ))}
                </main>
            )}
        </>
    );
}
