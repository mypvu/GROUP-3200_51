import DefaultParams from "../config/default_parameters.json"
import type { Compound } from "../core/models/compund.model"

export type CompundFilterInterface = Omit<Compound, "id" | "db_label">

export const DEFAULT_PARAMS: CompundFilterInterface = DefaultParams