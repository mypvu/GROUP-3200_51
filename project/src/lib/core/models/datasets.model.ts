import type { Compound, CompoundA, CompoundB } from "./compund.model";

export interface DataSetsInterface {
    A1: Compound[];
    A2: Compound[];
    B1: Compound[];
    B2: Compound[];
}

export default class DataSets implements Iterable<Compound> {
    constructor(
        public A1: CompoundA[],
        public A2: CompoundA[],
        public B1: CompoundB[],
        public B2: CompoundB[]
    ) {}

    *[Symbol.iterator](): Iterator<Compound> {
        for (const c of this.A1) yield c
        for (const c of this.A2) yield c
        for (const c of this.B1) yield c
        for (const c of this.B2) yield c
    }

    *traverseB(): Iterable<Compound> {
        for (const c of this.B1) yield c
        for (const c of this.B2) yield c
    }

    *traverseA(): Iterable<Compound> {
        for (const c of this.A1) yield c
        for (const c of this.A2) yield c
    }

    
}
