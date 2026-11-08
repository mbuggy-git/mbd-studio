import { Link } from "react-router-dom";

export type AppView = "brand" | "remix";

type Props = {
  current: AppView;
  className?: string;
};

const link =
  "rounded-full border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-6 py-3 font-label text-[16px] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground aria-[current=page]:border-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background";

/** Top menu inside the paid pair: Brand Palette ↔ Creative Remix. */
export function AppSwitcher({ current, className = "mb-ds-xl flex flex-wrap items-center justify-end gap-ds-sm" }: Props) {
  return (
    <nav aria-label="Switch tool" className={className}>
      <Link to="/brand" aria-current={current === "brand" ? "page" : undefined} className={link}>
        Brand Palette
      </Link>
      <Link to="/remix" aria-current={current === "remix" ? "page" : undefined} className={link}>
        Creative Remix
      </Link>
    </nav>
  );
}
