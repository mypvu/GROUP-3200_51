
import { ds } from "@/logic/utils/csvLoader";
import { parse_excel } from "@/logic/utils/fetch_excel";
import download_from_url from "@/logic/utils/network";
import { describe, it, expect, beforeEach, vi, test } from "vitest";


const excelLink = "http://134.115.198.190/v1/stage_1/Database_KDS_NP.xlsx"

const el = new URL(excelLink)

describe("testing parse the excel file", () => {

    it("test fetching dataset", async () => {

        const excel = await download_from_url(el)
        const nk_row_one = (await parse_excel(excel,"NK"))[0]

        expect(ds.NP_KDS[0]).toEqual(nk_row_one)
    })

}) 