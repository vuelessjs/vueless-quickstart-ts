import { getVuelessVersion } from "../api";

export default {
  async getVuelessVersion() {
    const response = await getVuelessVersion();

    const data = await response.json();

    this.$patch({ version: data.version });
  },
};
