import type { DataSetsID } from "./datasets.model"
import type DataSets from "./datasets.model"
import type Specturm from "./specturm.model"


export type ResultStage1 = {
    ids: DataSetsID,
    candidates: DataSets,
    version: string
}

export type ResultStage2 = {
    specturms: Specturm[]
    version: string
}