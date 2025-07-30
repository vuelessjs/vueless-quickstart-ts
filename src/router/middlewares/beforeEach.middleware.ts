import { loaderProgressOff } from "vueless";
import ApiService from "@/utils/api.js";

export default async (to, from, next) => {
  // stop top loader & cancel all pending requests
  loaderProgressOff("any");

  if (to.name !== from.name) {
    ApiService.cancelPendingRequests();
  }

  next();
};
