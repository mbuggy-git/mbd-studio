import { Link } from "react-router-dom";

export type AppView = "brand" | "vocabulary" | "remix";

type Props = {
  current: AppView;
  className?: string;
};

/** Shared top menu that switches between Brand Palette, Vocabulary Picker and Creative Remix. */
export function AppSwitcher({ current, className = "mb-ds-xl flex flex-wrap items-center justify-end gap-ds-sm" }: Props) {
  return (
    <nav aria-label="Switch tool" className={className} data-oid="2ea0a97fa6" data-oid-component-root="true" data-oid-callsite-deletable="true" data-oid-callsite-single="true" data-oid-callsite-editable="true" data-oid-classname-dynamic="true">
      <Link
        to="/brand"
        aria-current={current === "brand" ? "page" : undefined}
        className="rounded-full border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-6 py-3 font-label text-[16px] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground aria-[current=page]:border-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background" data-oid="b1d9f6a3c2" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
        Brand Palette
      </Link>
      <Link
        to="/"
        aria-current={current === "vocabulary" ? "page" : undefined}
        className="rounded-full border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-6 py-3 font-label text-[16px] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground aria-[current=page]:border-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background" data-oid="8facef791e" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
        Art Direction Palette
      </Link>
      <Link
        to="/remix"
        aria-current={current === "remix" ? "page" : undefined}
        className="rounded-full border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] px-6 py-3 font-label text-[16px] text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground aria-[current=page]:border-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background" data-oid="88083348f9" data-oid-callsite-deletable="true" data-oid-callsite-editable="true">
        Creative Remix
      </Link>
    </nav>
  );
}
