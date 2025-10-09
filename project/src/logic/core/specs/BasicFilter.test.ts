import { describe, it, expect, beforeEach, vi, test } from "vitest";
import BasicFilter from '../algorithms/BasicFilter'
import { ds, sample as i_sample } from '../../utils/csvLoader'
import test_case from './case.json'
import CompoundFilter from "../algorithms/filter";


const bf = new BasicFilter(i_sample, ds)
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

  it("Manual testing with NP_KDS", () => {

    sample.NP_KDS = {
      "db_label": "NK",
      "RF": 0.435,
      "DEV_254nm": 137.4,
      "DEV_366nm": 180,
      "VSNP_366nm": 210.9,
      "UV_Peaks_num": 1,
      "UV_Peaks": [276],
      "FL_Peaks_num": 2,
      "FL_Peaks": [225, 316]
    }


    const res = bf.set(sample, ds).extract()
    expect(res.ids().NK).toEqual([58]);

  });

});

describe("BasicFilter tests from case.json", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  for (const [section, tests] of Object.entries(test_case)) {
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


          const cf = new CompoundFilter({samples: sample, version: "1"})
          const res =  (await cf.st1()).candidates

          // compare expected
          const simpleResult = res.ids()[db_label as keyof ReturnType<typeof res.ids>];
          expect(simpleResult).toEqual(expected.result);
        });
      }
    });
  }
});
