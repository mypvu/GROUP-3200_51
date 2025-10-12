import { DataSets } from "../algo.interface";
import type { Stage, Version } from "../core/models/version.model";
import { fetch_dataset } from "./fetch_excel_st1";

interface ExcelServiceConfig {
    stage: Stage,
    version: Version,
    url: URL
}

export default class ExcelService{
    config: ExcelServiceConfig

    constructor(conf: ExcelServiceConfig) {
        this.config = conf
    }

    async pull_datasets(): Promise<DataSets> {
        // TODO: fix this (databaseUrl argument is wrong)
        return await fetch_dataset(this.config.url, this.config.url);
    }

    

}