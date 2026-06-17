import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import { registerPushServiceWorker } from "./utils/pushNotifications";
import { bindViewportHeight } from "./utils/viewportHeight";
import "./styles/theme.css";
import "./styles/global.css";

bindViewportHeight();
void registerPushServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);
