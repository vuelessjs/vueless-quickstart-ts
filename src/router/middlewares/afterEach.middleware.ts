import { getDelayedNotify, loaderOverlayOff, setTitle } from "vueless";
import type { RouteLocation } from "vue-router";

import { i18n } from "@/utils/i18n";

export default async (to: RouteLocation) => {
  // Show delayed notification.
  getDelayedNotify();

  // Meta data service.
  setTitle({
    title: to.meta?.title ? i18n.t(to.meta?.title) : "",
    suffix: import.meta.env.VITE_PROJECT_NAME,
  });

  // Disable the global full-screen loader.
  loaderOverlayOff();
};
