import { parse_excel } from "@/logic/utils/fetch_excel_st1";
import { fetchAndParseXY } from "@/logic/utils/fetch_excel_st2";
import download_from_url from "@/logic/utils/network";
import { describe, it, expect, beforeEach, vi, test } from "vitest";


const excelLink = "http://10.135.234.220/v1/stage_2/DEV_FL/2-Hydroxyacetophenone.xlsx"

const el = new URL(excelLink)

describe("testing parse the excel file", () => {

    it("test fetching dataset", async () => {

        console.log( await fetchAndParseXY(el))

    })

}) 