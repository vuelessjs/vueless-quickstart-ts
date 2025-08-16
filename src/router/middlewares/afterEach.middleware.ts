import { getDelayedNotify, loaderOverlayOff, setTitle } from "vueless";
import { i18n, getActiveLanguage } from "@/utils/i18n";
import type { RouteLocation } from "vue-router";

export default async (to: RouteLocation) => {
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
