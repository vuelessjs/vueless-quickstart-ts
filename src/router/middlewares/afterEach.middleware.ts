import { getDelayedNotify, loaderOverlayOff, setTitle } from "vueless";
import { i18n, getActiveLanguage } from "@/utils/i18n.ts";

export default async (to) => {
  if (import.meta.env.DEV) {
    const { validateModuleLocaleMassages } = await import("@/utils/localeValidation.ts");

    validateModuleLocaleMassages(to.meta?.module, getActiveLanguage());
  }

  // Show delayed notification.
  getDelayedNotify();

  // Meta data service.
  setTitle({
    title: to.meta?.title ? i18n.t(to.meta?.title) : "",
    suffix: import.meta.env.VITE_PROJECT_NAME,
  });

  // Disable global full screen loader (cat loader).
  loaderOverlayOff();
};
