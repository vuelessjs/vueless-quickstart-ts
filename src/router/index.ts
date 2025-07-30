import { createRouter, createWebHistory } from "vue-router";

import mainLayout from "./layouts/mainLayout";

import beforeEachMiddleware from "./middlewares/beforeEach.middleware";
import afterEachMiddleware from "./middlewares/afterEach.middleware";

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

router.beforeEach(beforeEachMiddleware);
router.afterEach(afterEachMiddleware);

// Load routes dynamically from modules and add them into related layouts.
router.init = async () => {
  const modules = import.meta.glob("@/modules/**/routes.ts");

  for (const path in modules) {
    const routes = await modules[path]();

    routes.default.forEach((route) => {
      route.meta = {
        ...route.meta,
        module: path.split("modules").pop().split("/").at(1),
      };

      /**
        Define routes for specific layouts.
      */
      if (route.meta?.isAuthLayout) {
        // Add route to auth layout
        // router.addRoute(isAuthLayout.name, route);
      } else {
        // Add route to main layout by default
        router.addRoute(mainLayout.name, route);
      }
    });
  }
};

export default router;
