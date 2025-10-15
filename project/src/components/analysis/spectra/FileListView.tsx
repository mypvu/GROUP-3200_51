import "styles/global.css";
import { useRef, useState } from "preact/hooks";
import type { Signal } from "@preact/signals-core";

export type UploadedFile = {
    name: string;
    ready: boolean;
    data?: ArrayBuffer;
};

// We need to be able to pass the file list while changing the reference to it once in a while
export type UploadedFileList = {
    files: UploadedFile[];
};

type Props = { result: Signal<UploadedFileList>; children?: any };

export default function FileListView({ result, children }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const MAX_FILE_AMOUNT = 6;

    // note(gio): using just setFileList isn't updating the view? probably because it's just being set to the same reference
    // (we're not using fileList as a state var anymore anyways)
    // hack fix for now, make our own react-like forceUpdate
    let x = 0;
    const [_, setXState] = useState<number>(0);
    const forceUpdate = () => {
        setXState(++x);
    };

    async function onFileInputChange(_: Event) {
        // @ts-ignore
        const inputFiles: FileList = fileInputRef.current?.files;
        if (inputFiles == null) return;

        const fileList = result.value;
        for (const file of Array.from(inputFiles)) {
            // Are we already loading this file?
            // We can replace files that have fully loaded, not files currently loading though
            const existing = fileList.files.find((f) => f.name === file.name);
            if (existing !== undefined && !existing.ready) {
                // We're still loading this file, skip it
                console.log("Not overwriting file: ", file.name);
                continue;
            }

            // Create (or reuse existing) UploadedFile instance
            let uploadedFile: UploadedFile = existing ?? {
                name: file.name,
                ready: false,
            };
            if (existing === undefined) {
                // Push the new instance to the list if needed
                fileList.files.push(uploadedFile);
                console.log("New UploadedFile instance: ", file.name);
            }

            // Update the state so the view updates (after init / reset)
            uploadedFile.ready = false;
            result.value = {
                files: fileList.files,
            };
            forceUpdate();

            // Start loading the file
            uploadedFile.data = await file.arrayBuffer();
            uploadedFile.ready = true;
            result.value = {
                files: fileList.files,
            };

            // Update the state so the view updates (after loaded)
            forceUpdate();
        }
    }

    function onRemoveFileClicked(file: UploadedFile) {
        const fileList = result.value;
        fileList.files = fileList.files.filter((f) => f !== file);
        result.value = { files: fileList.files };
        forceUpdate();
    }

    const fileList = result.value;

    return (
        <>
            <input
                ref={fileInputRef}
                onChange={onFileInputChange}
                className="hidden"
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                multiple
            />

            <main className="flex flex-col gap-4 rounded-2xl bg-white p-8 py-7 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800">
                    Upload Files
                </h3>

                {fileList !== undefined && fileList.files.length !== 0 ? (
                    <p className="text-gray-500">
                        <>
                            {fileList.files.length} / {MAX_FILE_AMOUNT} file
                            {fileList.files.length !== 1 ? "s" : ""} uploaded.
                        </>
                    </p>
                ) : (
                    <></>
                )}

                {fileList === undefined || fileList.files.length === 0 ? (
                    <p className="text-center text-gray-500">
                        No files uploaded.
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {fileList.files.map((v) => {
                            return (
                                <li className="flex items-center justify-between rounded-xl border border-gray-300 p-6 transition">
                                    <div>
                                        <p className="mb-0 text-gray-600">
                                            {v.name}
                                        </p>
                                    </div>
                                    <div>
                                        {v.ready ? (
                                            <a
                                                onClick={() =>
                                                    onRemoveFileClicked(v)
                                                }
                                                className="btn-hover-effect cursor-pointer rounded-lg bg-blue-500 px-5 py-2 font-semibold text-white transition hover:bg-blue-600"
                                            >
                                                Remove
                                            </a>
                                        ) : (
                                            <p className="mb-0 text-gray-400">
                                                loading...
                                            </p>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </div>
                )}

                <div className="flex flex-row items-center justify-center gap-4 mt-3">
                    {children}
                    <a
                        onClick={() => {
                            fileInputRef.current?.click();
                        }}
                        className="btn-hover-effect flex w-40 shrink cursor-pointer flex-row justify-center rounded-lg bg-blue-500 px-5 py-2 font-semibold text-white hover:bg-blue-600"
                    >
                        Upload
                    </a>
                </div>
            </main>
        </>
    );
}
