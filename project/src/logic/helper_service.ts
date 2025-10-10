export default class HelperService {
    private static analysisTypes: Record<string, string> = {
        "kds-np": "KDS + NP",
        "lds-np": "LDS + NP",
        "kds-vs": "KDS + VS",
        "lds-vs": "LDS + VS",
    };

    public static getTypeDisplayName(type: string): string {
        return this.analysisTypes[type];
    }

    public static doesTypeExist(type: string): boolean {
        return this.analysisTypes[type] !== undefined;
    }

    public static isVsType(type: string | undefined): boolean {
        if (type === undefined) return false;
        return type.endsWith("-vs");
    }
}
