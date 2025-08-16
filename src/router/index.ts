import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecord, RouteRecordName } from "vue-router";
type RoutesModule = { default: RouteRecord[] };

import mainLayout from "./layouts/mainLayout";

import beforeEachMiddleware from "./middlewares/beforeEach.middleware";
import afterEachMiddleware from "./middlewares/afterEach.middleware";

/**
 * Create Vue Router instance.
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_PATH),
  routes: [
    mainLayout,
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

/**
 * Add global middlewares.
 */
router.beforeEach(beforeEachMiddleware);
router.afterEach(afterEachMiddleware);

/**
 * Load routes dynamically from modules and add them into related layouts.
 */
async function initModuleRoutes(defaultLayoutName = "MainLayout") {
  const modules = import.meta.glob<RoutesModule>("@/modules/**/routes.ts");

  for (const path in modules) {
    const { default: routes } = await modules[path]();

    routes.forEach((route) => {
      route.meta = {
        ...route.meta,
        module: path.split("modules").pop()!.split("/").at(1),
      };

      const parentName: RouteRecordName = (route.meta as { layout?: RouteRecordName })?.layout;

      /* Define routes for specific layouts. */
      router.addRoute(parentName ?? defaultLayoutName, route);
    });
  }
}

export { router, initModuleRoutes };
