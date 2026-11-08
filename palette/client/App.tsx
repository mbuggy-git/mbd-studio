import { ThemeProvider } from "next-themes"
import { BrowserRouter, Route, Routes } from "./lib/router"
import Index from "./pages/Index"
import BrandPalette from "./pages/BrandPalette"
import NotFound from "./pages/NotFound"
import { RequireAccess } from "./components/RequireAccess"

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Routes>
          {/* Art Direction Palette is the free tool and the front door. */}
          <Route path="/" element={<Index view="vocabulary" />} />
          <Route path="/remix" element={<RequireAccess><Index view="remix" /></RequireAccess>} />
          <Route path="/brand" element={<RequireAccess><BrandPalette /></RequireAccess>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
