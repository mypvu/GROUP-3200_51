
import { ds, load_csv } from "@/logic/utils/csvLoader";
import { fetch_dataset, parse_excel } from "@/logic/utils/fetch_excel";
import download_from_url from "@/logic/utils/network";
import { describe, it, expect, beforeEach, vi, test } from "vitest";

const excelLink = "http://134.115.198.190/database_v1/stage_1/Database_KDS_NP.xlsx"

const el = new URL(excelLink)

describe("testing download from URL", () => {

    it("test download excel", async () => {
        const buf = download_from_url(el)
        expect((await buf).byteLength).not.toBeNull()
    })

    

    it("fetching all the dataset based on manifast in that folder", async () => {
        const sets = await fetch_dataset(new URL("http://134.115.198.190/database_v1/stage_1"))
        
        expect(ds.NP_KDS[0]).toEqual(sets.NP_KDS[0])
    })

}) 