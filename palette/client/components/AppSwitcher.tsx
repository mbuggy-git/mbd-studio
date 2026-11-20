import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { checkAccess } from "../lib/access";

export type AppView = "brand" | "remix" | "type" | "vocabulary";

type Props = {
  current: AppView;
  className?: string;
  /** Smaller pills, for headers where all three have to fit on one line. */
  compact?: boolean;
};

const pillBase =
  "whitespace-nowrap rounded-full border border-border bg-[color-mix(in_srgb,var(--primary)_4%,var(--background))] font-body font-medium text-[color-mix(in_srgb,var(--primary)_28%,var(--foreground))] hover:border-foreground";

/** Where the paid apps are sold, on the main site (outside this app's router). */
const LANDING = "/get-the-goods/brand-palette-remix";

/**
 * A pill to a paid app. Buyers go straight in; everyone else goes to the landing page.
 * Starts as the landing link, so a click before the purchase check returns never lands on a locked app.
 */
function PaidLink({ to, className, children }: { to: string; className: string; children: string }) {
  const [hasAccess, setHasAccess] = useState(false);
  useEffect(() => {
    let live = true;
    checkAccess().then((ok) => live && setHasAccess(ok));
    return () => {
      live = false;
    };
  }, []);
  return hasAccess ? <Link to={to} className={className}>{children}</Link> : <a href={LANDING} className={className}>{children}</a>;
}

/** Top menu on every tool: pills to the other tools. The app you're already in isn't listed. */
export function AppSwitcher({ current, className = "mb-ds-xl flex flex-wrap items-center justify-end gap-ds-sm", compact = false }: Props) {
  const link = `${pillBase} ${compact ? "px-3.5 py-1.5 text-[14px]" : "px-5 py-2 text-[16px]"}`;
  return (
    <nav aria-label="Switch tool" className={className}>
      {current !== "brand" && (
        <PaidLink to="/brand" className={link}>Brand Palette</PaidLink>
      )}
      {current !== "remix" && (
        // Text in the slate of "Remix" in the Creative Remix title (the accent token); ! beats the pill's default text colour.
        <PaidLink to="/remix" className={`${link} text-accent!`}>Creative Remix</PaidLink>
      )}
      {current !== "type" && (
        // Free, like Art Direction Palette. Text in the purple of the Type Palette page.
        <Link to="/type" className={`${link} text-[#954b9d]!`}>
          Type Palette
        </Link>
      )}
      {/* Text in the navy of the Art Direction Palette title (that page's primary, #06405e). */}
      {current !== "vocabulary" && (
        <Link to="/" className={`${link} text-[#06405e]!`}>
          Art Direction Palette
        </Link>
      )}
    </nav>
  );
}
