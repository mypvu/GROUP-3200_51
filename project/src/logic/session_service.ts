import { persistentAtom } from "@nanostores/persistent";
import type { InputParams } from "@core/models/search_parameters.model.ts";

interface ISessionData {
    id: string;
    created_at: Date;
    last_saved_at?: Date;
}

export class Session implements ISessionData {
    public id: string;
    public created_at: Date;
    public last_saved_at?: Date;

    /**
     * Create a new session.
     */
    constructor() {
        this.id = crypto.randomUUID();
        this.created_at = new Date();
        this.last_saved_at = undefined;
    }
}

const persistentSessionList = persistentAtom<ISessionData[] | undefined>(
    "sessions",
    [],
    { encode: JSON.stringify, decode: JSON.parse },
);

const persistentSessionCurrentId = persistentAtom<string | undefined>(
    "current-session",
    undefined,
    { encode: JSON.stringify, decode: JSON.parse },
);

export default class SessionService {
    private sessions: Session[];
    private currentSession?: Session;

    constructor() {
        // Get the list of sessions from local storage
        this.sessions = persistentSessionList.get() ?? [];

        // Find the current session
        let currentSessionId = persistentSessionCurrentId.get();
        if (currentSessionId != undefined) {
            this.currentSession = this.sessions.find(
                (x) => x.id == currentSessionId,
            );
        }

        console.log(
            `SessionService initialized! (session count = ${this.sessions.length}, current session ID = ${currentSessionId})`,
        );
    }

    public getSessions(): Session[] {
        return this.sessions;
    }

    public hasAnySessions(): Boolean {
        return this.sessions.length != 0;
    }

    public getCurrentSession(): Session | undefined {
        return this.currentSession;
    }

    public setCurrentSession(session: Session) {
        console.log(`Setting current session ID to ${session.id}`);
        persistentSessionCurrentId.set(session.id);
    }
}
