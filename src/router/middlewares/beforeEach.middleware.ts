import type { RouteLocation, NavigationGuardNext } from "vue-router";
import { loaderProgressOff } from "vueless";

import { http } from "@/utils/http";

export default async (to: RouteLocation, from: RouteLocation, next: NavigationGuardNext) => {
  // stop the top loader and cancel all pending requests
  loaderProgressOff("any");

  if (to.name !== from.name) {
    http.cancelPendingRequests();
  }

  next();
};
