import { createApp } from "vue";
import { createPinia } from "pinia";
import { createVueless, createVueI18nAdapter } from "vueless";

import { http } from "./utils/http";
import { i18nInstance } from "./utils/i18n";

import App from "./App.vue";
import { router, initModuleRoutes } from "./router";

import "/index.css";

http.init({
  baseUrl: import.meta.env.VITE_DOMAIN + import.meta.env.VITE_REST_API_PREFIX,
});

initModuleRoutes().then(() => {
  appInit();
});

function appInit() {
  const app = createApp(App);
  const pinia = createPinia();
  const vueless = createVueless({
    i18n: {
      adapter: createVueI18nAdapter(i18nInstance),
    },
  });

  app.use(router);
  app.use(i18nInstance);
  app.use(vueless);
  app.use(pinia);
  app.config.performance = true;

  app.mount("#app");
}
