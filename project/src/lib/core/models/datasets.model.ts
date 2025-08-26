import type { Compound} from "./compund.model";

export interface DataSetsInterface {
    NP1: Compound[];
    VS1: Compound[];
    NP2: Compound[];
    VS2: Compound[];
}

export default class DataSets implements Iterable<Compound> {
    constructor(
        public C_NP1: Compound[],
        public C_VS1: Compound[],
        public C_NP2: Compound[],
        public C_VS2: Compound[]
    ) {}

    *[Symbol.iterator](): Iterator<Compound> {
        for (const c of this.C_NP1) yield c
        for (const c of this.C_VS1) yield c
        for (const c of this.C_NP2) yield c
        for (const c of this.C_VS2) yield c
    }

    *NP1(): Iterable<Compound> {
        for (const c of this.C_NP1) yield c
    }

    *VS1(): Iterable<Compound> {
        for (const c of this.C_VS1) yield c
    }

    *NP2(): Iterable<Compound> {
        for (const c of this.C_NP2) yield c
    }

    *VS2() :Iterable<Compound> {
        for (const c of this.C_VS2) yield c
    }

    toArray(): Compound[] {
        return Array.from(this)
    }

    merge(): Compound[] {
    return [
        ...this.C_NP1,
        ...this.C_VS1,
        ...this.C_NP2,
        ...this.C_VS2
    ];
}
}
