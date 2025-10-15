import { persistentAtom } from "@nanostores/persistent";
import type { InputParams } from "@core/models/search_parameters.model.ts";
import type { ISampleContainer } from "@core/models/compund.model.ts";
import { SessionAlgorithmInputs } from "./algorithm_input";
import type { WritableAtom } from "nanostores";
import type { FilterResult } from "@/logic/filter_service.ts";

interface ISessionData {
    save(): Promise<void>;
    load(): Promise<boolean>;
    erase(): Promise<void>;
}

export class SessionData<T> implements ISessionData {
    private atom: WritableAtom<T | undefined>;
    public data?: T;

    constructor(sessionId: string, name: string) {
        this.atom = persistentAtom<T | undefined>(
            `session-${name}-${sessionId}`,
            undefined,

            {
                encode: JSON.stringify,

                // Turn the generic object (from JSON.parse) into a T object
                // decode: (x) => Object.assign(new T(), JSON.parse(x)),
                decode: JSON.parse,
            },
        );
    }

    async erase(): Promise<void> {
        this.atom.set(undefined);
    }

    async load(): Promise<boolean> {
        const stored = this.atom.get();
        if (stored !== undefined) {
            this.data = stored;
            return true;
        }

        return false;
    }

    async loadIfEmpty(): Promise<void> {
        if (this.data === undefined) {
            await this.load();
        }
    }

    async save(): Promise<void> {
        this.atom.set(this.data);
    }
}

export class SessionAlgorithmData {
    private sessionId: string;
    public inputs: SessionAlgorithmInputs = new SessionAlgorithmInputs();
    private atom: WritableAtom<SessionAlgorithmInputs | undefined>;

    constructor(sessionId: string) {
        this.sessionId = sessionId;

        this.atom = persistentAtom<SessionAlgorithmInputs | undefined>(
            `inputs-${this.sessionId}`,
            undefined,

            {
                encode: JSON.stringify,

                // Turn the generic object (from JSON.parse) into a SessionAlgorithmInputs object
                decode: (x) =>
                    Object.assign(new SessionAlgorithmInputs(), JSON.parse(x)),
            },
        );
    }

    public async save() {
        this.inputs.version = "1";
        this.atom.set(this.inputs);
    }

    public async load(): Promise<boolean> {
        let newData = this.atom.get();
        if (newData !== undefined) {
            this.inputs = newData!;
            this.inputs.version = "1";
            return true;
        }

        return false;
    }
}

export class SessionAlgorithmResult {
    private sessionId: string;
    public data?: FilterResult;
    private atom: WritableAtom<FilterResult | undefined>;

    constructor(sessionId: string) {
        this.sessionId = sessionId;

        this.atom = persistentAtom<FilterResult | undefined>(
            `result-${this.sessionId}`,
            undefined,
            {
                encode: JSON.stringify,
                decode: JSON.parse,
            },
        );
    }

    public async save() {
        this.atom.set(this.data);
    }

    public async load(): Promise<boolean> {
        let newData = this.atom.get();
        if (newData !== undefined) {
            this.data = newData!;
            return true;
        }

        return false;
    }
}

interface ISession {
    id: string;
    createdAt: Date;
    lastSavedAt?: Date;
}

export class Session implements ISession {
    public id: string;
    public createdAt: Date;
    public lastSavedAt?: Date;

    private algorithmData?: SessionAlgorithmData;
    private algorithmResult?: SessionAlgorithmResult;

    private sessionNotes?: SessionData<string>;

    /**
     * Create a new session.
     */
    constructor() {
        this.id = crypto.randomUUID();
        this.createdAt = new Date();
        this.lastSavedAt = undefined;
    }

    public async getAlgorithmData(): Promise<SessionAlgorithmData> {
        if (this.algorithmData !== undefined) {
            return this.algorithmData;
        }
        this.algorithmData = new SessionAlgorithmData(this.id);
        await this.algorithmData.load();
        return this.algorithmData;
    }

    public async getAlgorithmResult(): Promise<SessionAlgorithmResult> {
        if (this.algorithmResult !== undefined) {
            return this.algorithmResult;
        }
        this.algorithmResult = new SessionAlgorithmResult(this.id);
        await this.algorithmResult.load();
        return this.algorithmResult;
    }

    public async getSessionNotes(): Promise<SessionData<string>> {
        if (this.sessionNotes !== undefined) {
            return this.sessionNotes;
        }
        this.sessionNotes = new SessionData<string>(this.id, "notes");
        await this.sessionNotes.load();
        return this.sessionNotes;
    }
}

const persistentSessionList = persistentAtom<Session[] | undefined>(
    "sessions",
    [],
    {
        encode: JSON.stringify,
        decode: (x) => {
            let l: any[] = JSON.parse(x);
            return l.map((v) => {
                if (v !== undefined) {
                    // HACK: do not let these get parsed!
                    v.algorithmData = undefined;
                    v.algorithmResult = undefined;
                    v.sessionNotes = undefined;
                }
                return Object.assign(new Session(), v);
            });
        },
    },
);

const persistentSessionCurrentId = persistentAtom<string | undefined>(
    "current-session",
    undefined,
    { encode: JSON.stringify, decode: JSON.parse },
);

export default class SessionService {
    private sessions: Session[];
    private currentSession?: Session;

    private static singleton?: SessionService;

    public static getInstance(): SessionService {
        this.singleton ??= new SessionService();
        return this.singleton!;
    }

    constructor() {
        // Get the list of sessions from local storage
        this.sessions = persistentSessionList.get() ?? [];

        // Find the current session
        let currentSessionId = persistentSessionCurrentId.get();
        if (currentSessionId != undefined) {
            console.log(this.sessions);
            this.currentSession = this.sessions.find(
                (x) => x.id == currentSessionId,
            );
        }

        console.log(
            `SessionService initialized! (session count = ${this.sessions.length}, current session ID = ${currentSessionId})`,
        );
    }

    public async saveAllSessions() {
        persistentSessionList.set(this.sessions);
    }

    public getSessions(): Session[] {
        return this.sessions;
    }

    public async removeSession(s: Session) {
        this.sessions = this.sessions.filter((x) => x.id != s.id);
        persistentSessionList.set(this.sessions);
        if (this.currentSession?.id == s.id) {
            this.currentSession = undefined;
            persistentSessionCurrentId.set(undefined);
        }
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

    public async createNewSession(): Promise<Session> {
        let s = new Session();
        this.sessions.push(s);
        this.setCurrentSession(s);
        await this.saveAllSessions();
        return s;
    }
}
