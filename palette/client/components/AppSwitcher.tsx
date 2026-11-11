import { Link } from "react-router-dom";

export type AppView = "brand" | "remix";

type Props = {
  current: AppView;
  className?: string;
};

const link =
  "rounded-full border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-5 py-2 font-body text-[16px] font-medium text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground";

/** Top menu inside the paid pair: pills to the other tools. The app you're already in isn't listed. */
export function AppSwitcher({ current, className = "mb-ds-xl flex flex-wrap items-center justify-end gap-ds-sm" }: Props) {
  return (
    <nav aria-label="Switch tool" className={className}>
      {current !== "brand" && (
        <Link to="/brand" className={link}>
          Brand Palette
        </Link>
      )}
      {current !== "remix" && (
        // Text in the slate of "Remix" in the Creative Remix title (the accent token); ! beats the pill's default text colour.
        <Link to="/remix" className={`${link} text-accent!`}>
          Creative Remix
        </Link>
      )}
      {/* Text in the navy of the Art Direction Palette title (that page's primary, #06405e). */}
      <Link to="/" className={`${link} text-[#06405e]!`}>
        Art Direction Palette
      </Link>
    </nav>
  );
}
