import type { Sample } from "./compund.model"
import type { SpecturmsOnly } from "./specturm.model"



export type InputParams = {
    samples: Sample,
    version: string,
    unknownSpecturms: SpecturmsOnly
}