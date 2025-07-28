import { setTitle } from "vueless";
import i18nService, { i18n } from "@/utils/i18n";

export default (to) => {
  // Set module related messages.
  i18nService.setMessages(to.meta?.module);

  // Meta data service.
  setTitle({
    title: to.meta?.title ? i18n.t(to.meta?.title) : "",
    suffix: import.meta.env.VITE_PROJECT_NAME,
  });
};
