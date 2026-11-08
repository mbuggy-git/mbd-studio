import { Link } from "react-router-dom";
import { APPS_PRODUCT } from "../lib/config";
import preview from "../assets/apps-preview.webp";

/** Sits above "Your direction" on the free Palette: the two paid apps, one button. */
export function AppsCard() {
  return (
    <aside className="flex flex-col gap-ds-md overflow-hidden rounded-xl border border-border shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)]" style={{ backgroundColor: "#ccb7ed" }}>
      <Link to="/brand" aria-label={APPS_PRODUCT.name} className="block">
        <img src={preview} alt="Brand Palette and Creative Remix" className="block h-auto w-full" loading="lazy" />
      </Link>
      <div className="flex flex-col gap-ds-sm px-ds-xl pb-ds-xl">
        <p className="font-caption text-caption font-medium uppercase tracking-[0.24em]" style={{ color: "#5f5f7a" }}>Also from MBD Studio</p>
        <h2 className="font-display text-[28px] font-semibold leading-none tracking-[-0.02em] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))]">
          Brand Palette &amp; Creative Remix
        </h2>
        <p className="text-body text-[#3d3354]">
          Build a brand from concept to prompt-ready briefs, and remix style, influence and mood into
          directions you wouldn't have reached on your own.
        </p>
        <div className="mt-ds-xs flex items-center gap-ds-md">
          <Link to="/brand" className="ds-button ds-button-primary h-[42px] rounded-lg px-ds-lg">
            See the apps
          </Link>
          <span className="font-label text-[16px] text-[#3d3354]">{APPS_PRODUCT.price}</span>
        </div>
      </div>
    </aside>
  );
}
