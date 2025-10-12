import SessionService, { Session } from "@/logic/session/session_service.ts";
import { useEffect, useState } from "preact/hooks";
import CompoundHelper from "@/logic/compound_helper.ts";
import "./CompoundStatus.css";

type Props = { session: Session; compoundType: string };

export default function CompoundItem({ session, compoundType }: Props) {
    const [status, setStatus] = useState("...");
    const [classes, setClasses] = useState("status-empty");

    const compoundDisplayName = CompoundHelper.getTypeDisplayName(compoundType);

    // Load algorithm data once asynchronously
    useEffect(() => {
        (async () => {
            const sessionAlgorithmData = await session.getAlgorithmData();
            let compound =
                sessionAlgorithmData.inputs?.getCompoundByType(compoundType);
            if (compound === undefined) {
                // Empty
                setStatus("Empty");
                setClasses("status-empty");
            } else if (CompoundHelper.isCompoundComplete(compound)) {
                // Complete
                setStatus("Complete");
                setClasses("status-complete");
            } else {
                // Incomplete
                setStatus("Incomplete");
                setClasses("status-incomplete");
            }
        })();
    }, []);

    return (
        <>
            <div class="rounded-lg border-2 border-gray-500 bg-white p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">
                            {compoundDisplayName}
                        </h3>
                        <p
                            id="status"
                            class={`status mt-1 font-bold ${classes}`}
                        >
                            {status}
                        </p>
                    </div>
                    <a
                        href={`/GROUP-3200_51/analysis/new/details/${compoundType}`}
                        class="btn-hover-effect rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
                    >
                        Edit
                    </a>
                </div>
            </div>
        </>
    );
}
