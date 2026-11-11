import { useEffect, type ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { BrowserRouter, Route, Routes } from "./lib/router"
import Index from "./pages/Index"
import BrandPalette from "./pages/BrandPalette"
import NotFound from "./pages/NotFound"
import { RequireAccess } from "./components/RequireAccess"

/** Names the browser tab after the tool that is open. */
function Titled({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => {
    document.title = `${title} — MBD Studio`
  }, [title])
  return <>{children}</>
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Routes>
          {/* Art Direction Palette is the free tool and the front door. */}
          <Route path="/" element={<Titled title="Art Direction Palette"><Index view="vocabulary" /></Titled>} />
          <Route path="/remix" element={<Titled title="Creative Remix"><RequireAccess><Index view="remix" /></RequireAccess></Titled>} />
          <Route path="/brand" element={<Titled title="Brand Palette"><RequireAccess><BrandPalette /></RequireAccess></Titled>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
