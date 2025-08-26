import type { Compound, CompoundA, CompoundB } from "../models/compund.model";
import type DataSets from "../models/datasets.model";
import type { CompundFilterInterface } from "$lib/utils/rw";

export abstract class CompoundFilter {

    constructor(){}

    abstract extract(): DataSets
}