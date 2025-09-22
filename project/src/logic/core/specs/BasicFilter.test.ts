import { describe, it, expect, beforeEach, vi, test } from "vitest";
import BasicFilter from '../algorithms/BasicFilter'
import { ds,sample as i_sample } from '../../utils/csvLoader'
import test_case from './case.json'

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
    sample = { NP_KDS: undefined,
               NP_LDS: undefined,
               VS_KDS: undefined,
               VS_LDS: undefined}
  })

  it("Manual testing with NP_KDS", () => {

    sample.NP_KDS = {
      "db_label" : "NK",
      "RF": 0.435,
      "DEV_254nm": 137.4,
      "DEV_366nm": 180,
      "VSNP_366nm": 210.9,
      "UV_Peaks_num": 1,
      "UV_Peaks": [276],
      "FL_Peaks_num": 2,
      "FL_Peaks": [225, 316]
    }


    bf.set(sample,ds).extract()
    expect(bf.simple().NK).toEqual([58]);

    console.log(bf.simple())
    
  });

});

describe("BasicFilter tests from case.json", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  for (const [section, tests] of Object.entries(test_case)) {
    describe(`${section} testing`, () => {
      for (const [name, { input, expected }] of Object.entries(tests)) {
        it(name, () => {
          const { key, db_label } = sampleMap[section];

          // Fill sample with current test case
          // If it's a V-compound, include T field
          (sample as any)[key] = {
            db_label,
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

          bf.set(sample, ds).extract();

          // compare expected
          const simpleResult = bf.simple()[db_label as keyof ReturnType<typeof bf.simple>];
          expect(simpleResult).toEqual(expected.result);
        });
      }
    });
  }
});
