import type { Compound } from "../models/compund.model";

export abstract class Filter {

    constructor(){}

    abstract extract(): Compound[]
}