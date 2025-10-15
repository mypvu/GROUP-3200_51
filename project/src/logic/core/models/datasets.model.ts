import type { Compound, CompoundN, CompoundV } from "./compund.model";

export interface DataSetsID {
    NK: number[];
    NL: number[];
    VK: number[];
    VL: number[];
}

export interface DataSetsInterface {
    NK: CompoundN[];
    NL: CompoundN[];
    VK: CompoundV[];
    VL: CompoundV[];
}

export default class DataSets implements Iterable<Compound> {
    constructor(
        public NP_KDS: Compound[] = [],
        public NP_LDS: Compound[] = [],
        public VS_KDS: Compound[] = [],
        public VS_LDS: Compound[] = []
    ) { }

    *[Symbol.iterator](): Iterator<Compound> {
        for (const c of this.NP_KDS) yield c
        for (const c of this.VS_KDS) yield c
        for (const c of this.NP_LDS) yield c
        for (const c of this.VS_LDS) yield c
    }

    *NK(): Iterable<Compound> {
        for (const c of this.NP_KDS) yield c
    }

    *NL(): Iterable<Compound> {
        for (const c of this.NP_LDS) yield c
    }

    *VK(): Iterable<Compound> {
        for (const c of this.VS_KDS) yield c
    }

    *VL(): Iterable<Compound> {
        for (const c of this.VS_LDS) yield c
    }

    toArray(): Compound[] {
        return Array.from(this)
    }

    public count(): number {
        return this.NP_KDS.length + this.NP_LDS.length + this.VS_KDS.length + this.VS_LDS.length;
    }

    public merge(): Compound[] {
        const all = [
            ...this.NP_KDS,
            ...this.VS_KDS,
            ...this.NP_LDS,
            ...this.VS_LDS,
        ];

        const seen = new Set<number>();
        const unique: Compound[] = [];

        for (const c of all) {
            if (!seen.has(c.id)) {
                seen.add(c.id);
                unique.push(c);
            }
        }

        return unique;
    }

    ids(): DataSetsID {
        const toIds = (cs: Compound[]): number[] =>
            cs.map(c => (c.id !== undefined ? c.id : NaN))
                .filter(id => !isNaN(id))

        return {
            NK: toIds(this.NP_KDS),
            NL: toIds(this.NP_LDS),
            VK: toIds(this.VS_KDS),
            VL: toIds(this.VS_LDS)
        }
    }

    public filterPaired(): DataSets {
        const intersectById = (a: Compound[], b: Compound[]) => {
            // Build the id set from b
            const bIds = new Set(
                b
                    .map((c) => (typeof c.id === "number" ? c.id : NaN))
                    .filter((id) => !Number.isNaN(id))
            );
            // Keep a's items whose id is also in b
            return a.filter(
                (c) => typeof c.id === "number" && bIds.has(c.id as number)
            );
        };

        const nk = intersectById(this.NP_KDS, this.VS_KDS);
        const vk = intersectById(this.VS_KDS, this.NP_KDS);
        const nl = intersectById(this.NP_LDS, this.VS_LDS);
        const vl = intersectById(this.VS_LDS, this.NP_LDS);

        return new DataSets(nk, nl, vk, vl);
    }

    /**
     * Convenience: get the ids that survive the pair filter.
     */
    public pairedIds(): DataSetsID {
        return this.filterPaired().ids();
    }
}
