import { getVuelessVersion } from "../api";
import type { WelcomePageStore } from "./types";

export default {
  async getVuelessVersion(this: WelcomePageStore) {
    const response = await getVuelessVersion();

    const data = await response.json();

    this.$patch({ version: data.version });
  },
};
