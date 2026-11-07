import { useEffect } from "react";

// /palette — the public link for the Art Direction Palette (Firefly Builder
// app). Until the app is hosted here, this page forwards to the Builder
// preview. It is a page rather than a Vercel redirect so the UTM beacon in
// App.tsx fires first (keepalive, so the forward won't cancel it). When the
// app moves onto mbd.studio, this page becomes the app and the forward goes.
export const PALETTE_APP_URL =
  "https://firefly.adobe.com/builder/preview/601facdc-ba67-86cb-a6f6-c1163f658c05/";

export function PalettePage() {
  useEffect(() => {
    const t = window.setTimeout(() => window.location.replace(PALETTE_APP_URL), 300);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-200 px-6">
      <p className="text-center text-sm">
        Opening the Art Direction Palette…{" "}
        <a href={PALETTE_APP_URL} className="underline">
          Click here if it doesn't open.
        </a>
      </p>
    </main>
  );
}
