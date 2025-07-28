import { defineStore } from "pinia";

import actions from "./actions";
import getters from "./getters";

export const useWelcomePageStore = defineStore("WelcomePage", {
  state: () => ({
    version: "",
  }),
  actions,
  getters,
});
