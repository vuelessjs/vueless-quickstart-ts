import { createRouter, createWebHistory } from "vue-router";

import mainLayout from "./layouts/mainLayout";
import welcomePageRoutes from "../modules/WelcomePage/routes";

import beforeEachMiddleware from "./middlewares/beforeEach.middleware";
import afterEachMiddleware from "./middlewares/afterEach.middleware";

mainLayout.children = welcomePageRoutes;

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
  const modules = import.meta.glob("@/modules/**/routes.js");

  for (const path in modules) {
    const routes = await modules[path]();

    routes.default.forEach((route) => {
      route.meta = {
        ...route.meta,
        module: path.split("modules").pop().split("/").at(1),
      };

      if (route.meta?.isMainLayout) {
        router.addRoute(mainLayout.name, route);
      }
    });
  }
};

export default router;
