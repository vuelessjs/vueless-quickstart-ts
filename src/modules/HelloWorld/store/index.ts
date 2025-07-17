import { defineStore } from "pinia";

import actions from "./actions.ts";
import getters from "./getters.ts";

export const useHelloWorldStore = defineStore("HelloWorld", {
  state: () => ({}),
  actions,
  getters,
});
