import type { DataSetsID } from "./datasets.model"
import type DataSets from "./datasets.model"


export type ResultStage1 = {
    ids: DataSetsID,
    compounds: DataSets,
    version: string
}


export type ResultStage2 = {
    ids: DataSetsID,
    version: string
}