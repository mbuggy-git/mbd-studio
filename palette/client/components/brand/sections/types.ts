import type { BrandState } from "../../../lib/brand/types";
import type { Updater } from "../../../lib/brand/useBrandStore";

export type SectionProps = { brand: BrandState; set: Updater; commit: Updater };
