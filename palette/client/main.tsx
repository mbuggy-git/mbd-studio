import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./global.css"
import { reportUtmClick } from "./lib/utmBeacon"

reportUtmClick()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
