import type { InputParams } from "@core/models/search_parameters.model.ts";
import type {
    Compound,
    CompoundN,
    CompoundV,
    ISampleContainer,
    Sample,
} from "@core/models/compund.model.ts";
import CompoundHelper from "@/logic/compound_helper.ts";

export class SessionAlgorithmInputs implements InputParams {
    public specturmBuffer: ArrayBuffer = null;
    public samples: ISampleContainer = {};
    public version: string = "";

    public getCompoundByType(type: string): Compound | undefined {
        switch (type.toLowerCase()) {
            case "kds-np":
                return this.samples.NP_KDS;
            case "lds-np":
                return this.samples.NP_LDS;
            case "kds-vs":
                return this.samples.VS_KDS;
            case "lds-vs":
                return this.samples.VS_LDS;
        }
        return undefined;
    }

    public setCompoundByType(type: string, compound: Compound) {
        switch (type.toLowerCase()) {
            case "kds-np":
                // @ts-ignore
                this.samples.NP_KDS = compound;
                break;
            case "lds-np":
                // @ts-ignore
                this.samples.NP_LDS = compound;
                break;
            case "kds-vs":
                // @ts-ignore
                this.samples.VS_KDS = compound;
                break;
            case "lds-vs":
                // @ts-ignore
                this.samples.VS_LDS = compound;
                break;
        }
    }

    public getOrCreateCompoundByType(type: string): Compound | undefined {
        switch (type.toLowerCase()) {
            case "kds-np":
                this.samples.NP_KDS ??=
                    CompoundHelper.createEmptyCompoundNByType(type);
                return this.samples.NP_KDS;
            case "lds-np":
                this.samples.NP_LDS ??=
                    CompoundHelper.createEmptyCompoundNByType(type);
                return this.samples.NP_LDS;
            case "kds-vs":
                this.samples.VS_KDS ??=
                    CompoundHelper.createEmptyCompoundVByType(type);
                return this.samples.VS_KDS;
            case "lds-vs":
                this.samples.VS_LDS ??=
                    CompoundHelper.createEmptyCompoundVByType(type);
                return this.samples.VS_LDS;
        }
        return undefined;
    }

    public allCompoundsComplete(): boolean {
        if (this.samples.NP_KDS === undefined) return false;
        if (!CompoundHelper.isCompoundComplete(this.samples.NP_KDS))
            return false;
        if (this.samples.NP_LDS === undefined) return false;
        if (!CompoundHelper.isCompoundComplete(this.samples.NP_LDS))
            return false;
        if (this.samples.VS_KDS === undefined) return false;
        if (!CompoundHelper.isCompoundComplete(this.samples.VS_KDS))
            return false;
        if (this.samples.VS_LDS === undefined) return false;
        return CompoundHelper.isCompoundComplete(this.samples.VS_LDS);
    }
}
