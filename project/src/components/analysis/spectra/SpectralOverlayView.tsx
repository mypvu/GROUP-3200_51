import { useEffect, useRef, useState } from "preact/hooks";
import { useSignal, computed, useComputed } from "@preact/signals";
import FileListView, {
    type UploadedFile,
    type UploadedFileList,
} from "@/components/analysis/spectra/FileListView.tsx";
import SessionService, {
    type Session,
} from "@/logic/session/session_service.ts";
import FilterService, { type FilterResult } from "@/logic/filter_service.ts";
import type {
    ResultStage1,
    ResultStage2,
} from "@core/models/result_parameters.model.ts";
import type { InputParams } from "@core/models/search_parameters.model.ts";
import { plotSpectrum } from "@/logic/plot";
import { For, Show } from "@preact/signals/utils";

export default function SpectralOverlayView() {
    const uploadedFiles = useSignal<UploadedFileList>({ files: [] });
    let [stage2Results, setStage2Results] = useState<
        ResultStage2 | undefined
    >();
    let [session, setSession] = useState<Session | undefined>();
    let hasFiles = useComputed(() => {
        return (
            uploadedFiles !== undefined && uploadedFiles.value.files.length > 0
        );
    });
    let hasResults = useComputed(() => {
        return true || stage2Results !== undefined;
    });

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

    async function runStage2(
        files: UploadedFile[],
        stage1Result: ResultStage1,
        stage1Inputs: InputParams,
    ): Promise<ResultStage2 | undefined> {
        // TODO: implement this
    }

    async function startAnalysisUx(): Promise<string | undefined> {
        const stage1Result = (await session?.getAlgorithmResult())?.data
            ?.resultForStageOne;
        if (stage1Result === undefined) {
            return "Failed to get stage 1 results";
        }

        const stage1Inputs = (await session?.getAlgorithmData())?.inputs;
        if (stage1Inputs === undefined) {
            return "Failed to get stage 1 inputs";
        }

        // Run the algorithm
        const stage2AlgorithmResult = await runStage2(
            uploadedFiles.value.files,
            stage1Result,
            stage1Inputs,
        );
        if (stage2AlgorithmResult === undefined) {
            setStage2Results(undefined);
            return "Failed to run stage 2";
        }

        setStage2Results(stage2AlgorithmResult);
    }

    async function onRunAnalysisClicked() {
        const result = await startAnalysisUx();
        if (result === undefined) {
            return;
        }

        alert(`Failed to run analysis: '${result}'`);
    }

    return (
        <div class="flex flex-col gap-4">
            <FileListView result={uploadedFiles}>
                {/* neat little component helper */}
                <Show when={hasFiles}>
                    <a
                        onClick={onRunAnalysisClicked}
                        className="btn-hover-effect flex w-40 shrink cursor-pointer flex-row justify-center rounded-lg bg-blue-500 px-5 py-2 font-semibold text-white hover:bg-blue-600"
                    >
                        <span class="text-center">Run Analysis</span>
                    </a>
                </Show>
            </FileListView>

            <Show when={hasResults}>
                <main className="flex flex-col gap-4 rounded-2xl bg-white p-8 py-7 shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-800">
                        Results
                    </h3>

                    <div class="rounded-lg bg-gray-100 p-8 py-7">
                        <h2 className="text-xl font-bold text-gray-600">
                            Candidates
                        </h2>
                    </div>
                </main>
            </Show>
        </div>
    );
}
