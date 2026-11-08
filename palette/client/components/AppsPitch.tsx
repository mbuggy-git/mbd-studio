import { Link } from "react-router-dom";
import { APPS_PRODUCT } from "../lib/config";

/** Replaces the switcher on the free Art Direction Palette: one line, one button. */
export function AppsPitch() {
  return (
    <div className="mb-ds-xl flex flex-wrap items-center justify-end gap-ds-md">
      <p className="font-caption text-caption text-[#cfcfe6]">
        Also from MBD Studio: {APPS_PRODUCT.name} · {APPS_PRODUCT.price}
      </p>
      <Link
        to="/brand"
        className="rounded-full border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-6 py-3 font-label text-[16px] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground"
      >
        See the apps
      </Link>
    </div>
  );
}
