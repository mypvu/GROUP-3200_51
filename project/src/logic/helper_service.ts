import type {
    Compound,
    CompoundV,
    CompoundN,
    DBLabel,
    Sample,
} from "@core/models/compund.model.ts";

interface AnalysisType {
    displayName: string;
    dbLabel: string;
    isVsType: boolean;
}

export default class HelperService {
    private static analysisTypes: Record<string, AnalysisType> = {
        "kds-np": {
            displayName: "KDS + NP",
            dbLabel: "NK",
            isVsType: false,
        },
        "lds-np": {
            displayName: "LDS + NP",
            dbLabel: "NL",
            isVsType: false,
        },
        "kds-vs": {
            displayName: "KDS + VS",
            dbLabel: "VK",
            isVsType: true,
        },
        "lds-vs": {
            displayName: "LDS + VS",
            dbLabel: "VL",
            isVsType: true,
        },
    };

    public static getTypeDisplayName(
        type: string | undefined,
    ): string | undefined {
        if (!this.doesTypeExist(type)) return undefined;
        return this.analysisTypes[type!].displayName;
    }

    public static doesTypeExist(type: string | undefined): boolean {
        if (type === undefined) return false;
        return this.analysisTypes[type] !== undefined;
    }

    public static isVsType(type: string | undefined): boolean {
        if (!this.doesTypeExist(type)) return false;
        return this.analysisTypes[type!].isVsType;
    }

    public static getDbLabelForType(
        type: string | undefined,
    ): DBLabel | undefined {
        if (!this.doesTypeExist(type)) return undefined;
        return this.analysisTypes[type!].dbLabel as DBLabel;
    }

    public static isCompoundComplete(c: Compound) {
        // console.log(c);
        if (c.RF === undefined) return false;
        if (c.DEV_254nm === undefined) return false;
        if (c.DEV_366nm === undefined) return false;
        if (c.VSNP_366nm === undefined) return false;
        //if (c.UV_Peaks === undefined) return false;
        //if (c.FL_Peaks === undefined) return false;
        if (c.UV_Peaks_num === undefined) return false;
        if (c.FL_Peaks_num === undefined) return false;
        //if (c.UV_Peaks_num != c.UV_Peaks.length) return false;
        //if (c.FL_Peaks_num != c.FL_Peaks.length) return false;

        return true;
    }

    public static createEmptyCompoundNByType(
        type: string | undefined,
    ): CompoundN | undefined {
        if (!this.doesTypeExist(type)) return undefined;
        let typeData = this.analysisTypes[type!];

        if (typeData.isVsType) return undefined;

        return {
            db_label: this.getDbLabelForType(type)! as "NK" | "NL",
        };
    }

    public static createEmptyCompoundVByType(
        type: string | undefined,
    ): CompoundV | undefined {
        if (!this.doesTypeExist(type)) return undefined;
        let typeData = this.analysisTypes[type!];

        if (!typeData.isVsType) return undefined;

        return {
            T: null,
            db_label: this.getDbLabelForType(type)! as "VK" | "VL",
        };
    }

    public static getCompoundByType(
        type: string,
        sample: Sample,
    ): Compound | undefined {
        switch (type.toLowerCase()) {
            case "kds-np":
                return sample.NP_KDS;
            case "lds-np":
                return sample.NP_LDS;
            case "kds-vs":
                return sample.VS_KDS;
            case "lds-vs":
                return sample.VS_LDS;
        }
        return undefined;
    }

    public static getOrCreateCompoundByType(
        type: string,
        sample: Sample,
    ): Compound | undefined {
        switch (type.toLowerCase()) {
            case "kds-np":
                sample.NP_KDS ??= this.createEmptyCompoundNByType(type);
                return sample.NP_KDS;
            case "lds-np":
                sample.NP_LDS ??= this.createEmptyCompoundNByType(type);
                return sample.NP_LDS;
            case "kds-vs":
                sample.VS_KDS ??= this.createEmptyCompoundVByType(type);
                return sample.VS_KDS;
            case "lds-vs":
                sample.VS_LDS ??= this.createEmptyCompoundVByType(type);
                return sample.VS_LDS;
        }
        return undefined;
    }
}
