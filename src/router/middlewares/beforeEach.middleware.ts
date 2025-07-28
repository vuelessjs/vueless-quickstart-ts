import { useLoaderOverlay } from "vueless";

export default async (to, from, next) => {
  // Toggle full screen rendering loader.
  const { loaderOverlayOn, loaderOverlayOff } = useLoaderOverlay();

  loaderOverlayOn();

  setTimeout(() => {
    loaderOverlayOff();
  }, 500);

  next();
};
