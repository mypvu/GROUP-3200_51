import type { DataSetsID } from "./datasets.model"
import type DataSets from "./datasets.model"

export type Out_Stage_1 = {
    ids: DataSetsID,
    compounds: DataSets,
    version: string
}

export type Out_Stage_2 = {
    ids: DataSetsID,
    version: string
}