import { createApp } from "vue";
import { createPinia } from "pinia";
import { createVueless, createVueI18nAdapter } from "vueless";

import { http } from "./utils/http.ts";
import { i18nInstance } from "./utils/i18n.ts";

import App from "./App.vue";
import router from "./router";

import "/index.css";

http.init();
router.init().then(() => {
  appInit();
});

function appInit() {
  const app = createApp(App);
  const vueless = createVueless({
    i18n: {
      adapter: createVueI18nAdapter(i18nInstance),
    },
  });

  const pinia = createPinia();

  app.use(router);
  app.use(i18nInstance);
  app.use(vueless);
  app.use(pinia);
  app.config.performance = true;

  app.mount("#app");
}
