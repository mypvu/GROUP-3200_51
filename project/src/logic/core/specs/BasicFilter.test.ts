import { describe, it, beforeEach } from "vitest";
import BasicFilter from '../algorithms/BasicFilter'
import { ds, sample as i_sample } from '../../utils/csvLoader'
import CompoundFilter from "../algorithms/filter";
import SpecturmFilter from "../algorithms/SpecturmFilter";
import type { Plot } from "../models/specturm.model";
import UnknownSpecturm from "./Unknown_p.json"
import testcases from "./case.json"


const bf = new BasicFilter(i_sample, ds)
const sf = new SpecturmFilter([], "1")

let sample = i_sample

// mapping between test section and sample key/db_label
const sampleMap: Record<string, { key: keyof typeof sample; db_label: string }> = {
  KDS_NP: { key: "NP_KDS", db_label: "NK" },
  LDS_NP: { key: "NP_LDS", db_label: "NL" },
  KDS_VS: { key: "VS_KDS", db_label: "VK" },
  LDS_VS: { key: "VS_LDS", db_label: "VL" },
};


describe("Manual testing for Basic Filter", () => {

  beforeEach(() => {
    sample = {
      "NP_KDS": {
        "db_label": "NK",
        "RF": 0,
        "DEV_254nm": 0,
        "DEV_366nm": 0,
        "VSNP_366nm": 0,
        "UV_Peaks_num": 0,
        "UV_Peaks": [],
        "FL_Peaks_num": 0,
        "FL_Peaks": []
      },
      "NP_LDS": {
        "db_label": "NL",
        "RF": 0,
        "DEV_254nm": 0,
        "DEV_366nm": 0,
        "VSNP_366nm": 0,
        "UV_Peaks_num": 0,
        "UV_Peaks": [],
        "FL_Peaks_num": 0,
        "FL_Peaks": []
      },
      "VS_KDS": {
        "db_label": "VK",
        "RF": 0,
        "DEV_254nm": 0,
        "DEV_366nm": 0,
        "VSNP_366nm": 0,
        "UV_Peaks_num": 0,
        "UV_Peaks": [],
        "FL_Peaks_num": 0,
        "FL_Peaks": [],
        "T": null
      },
      "VS_LDS": {
        "db_label": "VL",
        "RF": 0,
        "DEV_254nm": 0,
        "DEV_366nm": 0,
        "VSNP_366nm": 0,
        "UV_Peaks_num": 0,
        "UV_Peaks": [],
        "FL_Peaks_num": 0,
        "FL_Peaks": [],
        "T": null
      }
    }
  })

  it("Manual testing with NP_KDS", async () => {

    sample.NP_KDS = {
      "db_label": "NK",
      "RF": 0.435
      // "DEV_254nm": 137.4,
      // "DEV_366nm": 180,
      // "VSNP_366nm": 210.9,
      // "UV_Peaks_num": 1,
      // "UV_Peaks": [276],
      // "FL_Peaks_num": 2,
      // "FL_Peaks": [225, 316]
    }

    sample.NP_LDS = {
      "db_label": "NL",
      "RF": 0.6
    }


    const cf = new CompoundFilter({
      samples: sample,
      version: "1",
    })

    const candidates = (await cf.st1("1")).candidates
    console.log(candidates.ids())

    // const s2_result = await sf.set(candidates.merge(), "1", {
    //      DF: new ArrayBuffer(),
    //      UD: new ArrayBuffer(),
    //     FDN: new ArrayBuffer(),
    //     FDV: new ArrayBuffer(),
    //     UDP: new ArrayBuffer(),
    //     UDV: new ArrayBuffer()
    //   }).extract()
    

    // console.log(s2_result.specturms[0].plot)


  });

});

describe("BasicFilter tests from case.json", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  for (const [section, tests] of Object.entries(testcases)) {
    describe(`${section} testing`, async () => {
      for (const [name, { input, expected }] of Object.entries(tests)) {
        it(name,async () => {
          const { key, db_label } = sampleMap[section];

          // Fill sample with current test case
          // If it's a V-compound, include T field
          (sample as any)[key] = {
            db_label,
            name,
            RF: input.rf,
            DEV_254nm: input.colour1,
            DEV_366nm: input.colour2,
            VSNP_366nm: input.colour3,
            UV_Peaks_num: input.uv_peaks_num,
            UV_Peaks: input.uv_peaks,
            FL_Peaks_num: input.fl_peaks_num,
            FL_Peaks: input.fl_peaks,
            ...(input.t !== undefined ? { T: input.t } : {}),
          };


          const cf = new CompoundFilter({samples: sample, version: "1", unknownSpecturms: {
         DF: new ArrayBuffer(),
         UD: new ArrayBuffer(),
        FDN: new ArrayBuffer(),
        FDV: new ArrayBuffer(),
        UDP: new ArrayBuffer(),
        UDV: new ArrayBuffer()
      }})
          const res =  (await cf.st1()).candidates

          // compare expected
          const simpleResult = res.ids()[db_label as keyof ReturnType<typeof res.ids>];
          expect(simpleResult).toEqual(expected.result);

          // const s2_result = await sf.set(res.merge(), "1").extract()
          // console.log(s2_result)

        });
      }
    });
  }
});
