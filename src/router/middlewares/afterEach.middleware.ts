import { getDelayedNotify, loaderOverlayOff, setTitle } from "vueless";
import { i18n, getActiveLanguage } from "@/utils/i18n.ts";
import type { RouteLocation } from "vue-router";

export default async (to: RouteLocation) => {
  // Check are locale keys in the right order in all files.
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

  // Disable global full screen loader.
  loaderOverlayOff();
};
