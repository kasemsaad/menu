import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import api from "./lib/api";
import { applyBrandTheme, normalizeHex } from "./lib/colors";
import { configureNotificationSounds } from "./lib/sounds";
import type { AppSettings } from "./types";
import "./i18n";
import "./index.css";

const mount = () => {
  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

api
  .get<AppSettings>("/settings")
  .then(({ data }) => {
    applyBrandTheme(
      normalizeHex(data.primaryColor),
      normalizeHex(data.accentColor, normalizeHex(data.primaryColor))
    );
    configureNotificationSounds(data.notificationSounds, data.soundVolume ?? 0.85);
  })
  .catch(() => {})
  .finally(mount);

