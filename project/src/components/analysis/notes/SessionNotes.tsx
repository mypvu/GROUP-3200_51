import SessionService, {
    Session,
    SessionData,
} from "@/logic/session/session_service.ts";
import { useEffect, useState } from "preact/hooks";
import type { Compound } from "@core/models/compund.model.ts";

type Props = { session: Session; storage: SessionData<string> };

export default function SessionNotes({ session, storage }: Props) {
    function updateData(value: string) {
        storage.data = value;
        storage.save();
    }

    return (
        <>
            <div className="rounded-lg bg-white p-6">
                <h3 className="mb-4 text-xl font-bold text-gray-800">Notes</h3>
                <textarea
                    className="h-32 w-full rounded border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Add notes about your analyses here..."
                    value={storage.data ?? ""}
                    onChange={(e) => updateData(e.currentTarget.value)}
                ></textarea>
                {/*<button className="btn-hover-effect mt-3 w-full rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600">
                    Save Notes
                </button>*/}
            </div>
        </>
    );
}
