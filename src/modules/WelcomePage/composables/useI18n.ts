/* eslint-disable @typescript-eslint/no-explicit-any */
import { useI18n } from "vue-i18n";

import en from "../i18n/en.yaml";

export function useModuleI18n() {
  return useI18n({
    messages: {
      en,
    },
  }) as any;
}
