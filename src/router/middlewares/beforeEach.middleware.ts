import { loaderProgressOff } from "vueless";
import { http } from "@/utils/http";
import type { RouteLocation, NavigationGuardNext } from "vue-router";

export default async (to: RouteLocation, from: RouteLocation, next: NavigationGuardNext) => {
  // stop top loader & cancel all pending requests
  loaderProgressOff("any");

  if (to.name !== from.name) {
    http.cancelPendingRequests();
  }

  next();
};
