import { createApp } from "vue";
import { createPinia } from "pinia";
import { createVueless, createVueI18nAdapter } from "vueless";

import ApiService from "./utils/apiUtils";
import i18nService, { i18nInstance } from "./utils/i18nUtils";
import { auth0 } from "./utils/auth0Util";

import App from "./App.vue";
import router from "./router";

import "/index.css";

ApiService.init();
i18nService.init().then(() => {
  router.init().then(() => {
    appInit();
  });
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
  app.use(auth0);
  app.use(i18nInstance);
  app.use(vueless);
  app.use(pinia);
  app.config.performance = true;

  app.mount("#app");
}
