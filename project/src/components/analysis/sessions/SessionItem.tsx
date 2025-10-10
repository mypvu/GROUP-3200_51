import SessionService, { Session } from "@/logic/session/session_service.ts";

type Props = { session: Session; sessionService: SessionService };

function formatDateTime(iso: Date) {
    return iso.toLocaleString("en-AU", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export default function SessionItem({ session, sessionService }: Props) {
    const onSessionContinueClicked = () => {
        // Continue was clicked, change to that session
        sessionService.setCurrentSession(session);

        // Redirect to the new analysis page
        window.location.href = "/analysis/new";
    };

    return (
        <>
            <li className="flex items-center justify-between rounded-xl border border-gray-300 p-6 transition hover:shadow-md">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                        Analysis
                    </h3>
                    <p className="mt-1 text-gray-600">
                        {session.lastSavedAt === undefined
                            ? "Last saved on"
                            : "Created on"}
                        <span className="ml-1 font-semibold text-gray-700">
                            {formatDateTime(
                                session.lastSavedAt ?? session.createdAt,
                            )}
                        </span>
                    </p>
                </div>
                <a
                    onClick={onSessionContinueClicked}
                    className="btn-hover-effect cursor-pointer rounded-lg bg-blue-500 px-5 py-2 font-semibold text-white hover:bg-blue-600"
                >
                    Continue
                </a>
            </li>
        </>
    );
}
