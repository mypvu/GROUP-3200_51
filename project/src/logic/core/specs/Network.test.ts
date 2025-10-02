
import { ds, load_csv } from "@/logic/utils/csvLoader";
import { fetch_dataset, parse_excel } from "@/logic/utils/fetch_excel_st1";
import download_from_url from "@/logic/utils/network";
import { describe, it, expect, beforeEach, vi, test } from "vitest";
import conf from "../../config/conf.json"

const excelLink = "http://134.115.198.190/v1/stage_1/Database_KDS_NP.xlsx"

const el = new URL(excelLink)

describe("testing download from URL", () => {

    it("test download excel", async () => {
        const buf = download_from_url(el)
        expect((await buf).byteLength).not.toBeNull()
    })
    

    it("fetching all the dataset based on manifast in that folder", async () => {

        const res = await fetch_dataset(new URL(conf.database_url +"/v1" + "/stage_1"))

        expect(res.NP_KDS[0]).toEqual(ds.NP_KDS[0])
    })

}) 