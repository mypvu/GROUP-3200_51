import DefaultFilter from "../config/default_filter.json"
import type { Compound } from "../core/models/compund.model"

export type CompundFilter = Omit<Compound, "id" | "db_label">

export const defaultCompundFilter: CompundFilter = DefaultFilter