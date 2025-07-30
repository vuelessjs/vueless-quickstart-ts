import { createI18n, useI18n } from "vue-i18n";
import { merge } from "lodash-es";
import { getCurrentInstance } from "vue";

class I18nService {
  static FALLBACK_LOCALE = "en";
  static LOCALE_KEY = "language";

  #globalMessages = {};
  #moduleMessages = {};

  constructor({ fallbackLocale } = {}) {
    this._fallbackLocale = fallbackLocale || I18nService.FALLBACK_LOCALE;

    this.createI18nInstance();
  }

  createI18nInstance() {
    this.i18nInstance = createI18n({
      legacy: false,
      messages: {},
      locale: this.getActiveLanguage(),
      fallbackLocale: this._fallbackLocale,
      missing: this.missing,
      warnHtmlMessage: false,
      pluralRules: {
        ru: this.pluralizationRules,
        ua: this.pluralizationRules,
      },
    });
  }

  async init() {
    // Auto import global translations.
    const global = import.meta.glob("@/i18n/**/*.yaml");

    for (const path in global) {
      const locales = await global[path]();
      const lang = path.split(".").shift().split("/").pop();

      this.#globalMessages[lang] = locales.default;
    }

    // Auto import translations from the modules.
    const modules = import.meta.glob("@/modules/**/*.yaml");

    for (const path in modules) {
      const locales = await modules[path]();
      const lang = path.split(".").shift().split("/").pop();
      const module = path.split("modules").pop().split("/").at(1);

      this.#moduleMessages[lang] = {
        ...this.#moduleMessages[lang],
        [module]: locales.default,
      };
    }

    this.setMessages();
  }

  setMessages(module) {
    const lang = this.getActiveLanguage();

    const messages = this.#moduleMessages[lang]
      ? merge(this.#moduleMessages[lang][module], this.#globalMessages[lang])
      : this.#globalMessages[lang];

    this.i18nInstance.global.setLocaleMessage(lang, messages);

    if (import.meta.env.DEV) {
      this.checkLocaleDifference(messages, module, lang);
    }
  }

  /**
   * Check current locales keys and return path difference.
   *
   * @param messages
   * @param module
   * @param lang
   * @returns array
   */
  checkLocaleDifference(messages, module, lang) {
    if (sessionStorage.getItem("localeKeysDiff")) {
      sessionStorage.removeItem("localeKeysDiff");

      return;
    }

    const fallbackLang = this._fallbackLocale;
    const fallbackMessages = this.#moduleMessages[fallbackLang]
      ? merge(this.#moduleMessages[fallbackLang][module], this.#globalMessages[fallbackLang])
      : this.#globalMessages[fallbackLang];

    const diffKeys = this.compareKeys(messages, fallbackMessages);
    const message = `There are keys difference between "${fallbackLang}" and "${lang}" locales:`;

    if (diffKeys.length) {
      // eslint-disable-next-line no-console
      console.warn(message, diffKeys);
    }

    sessionStorage.setItem("localeKeysDiff", "true");
  }

  compareKeys(obj1, obj2, path = "") {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const uniqueKeys = new Set([...keys1, ...keys2]);

    let diffPaths = [];

    uniqueKeys.forEach((key) => {
      const newPath = path ? `${path}.${key}` : key;

      if (!(key in obj1) || !(key in obj2)) {
        diffPaths.push(newPath);
      } else if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
        const nestedDiffs = this.compareKeys(obj1[key], obj2[key], newPath);

        diffPaths = diffPaths.concat(nestedDiffs);
      }
    });

    return diffPaths;
  }

  missing() {
    // Handle issues here by Honeybadger.io or similar error tracking app.
  }

  pluralizationRules(value, plurals) {
    let pluralIndex = 0;

    if (value) {
      const remainder = value % 10;
      const teen = value > 10 && value < 20;
      const endsWithOne = remainder === 1;

      if (plurals < 4) {
        pluralIndex = !teen && endsWithOne ? 1 : 2;
      } else {
        pluralIndex = 3;
        if (!teen && endsWithOne) pluralIndex = 1;
        if (!teen && remainder >= 2 && remainder <= 4) pluralIndex = 2;
      }
    }

    return pluralIndex;
  }

  /**
   * Get translation from global or local scopes
   * @param localPath {string}
   * @param params {$ObjMap}
   * @returns {string}
   */
  getTranslation(localPath, params = {}) {
    const { t, tm } = useI18n({ useScope: "local" });
    const { t: tGlobal, tm: tmGlobal, te: teGlobal } = useI18n({ useScope: "global" });

    const componentName = getCurrentInstance().type.name;
    const globalPath = `${componentName}.${localPath}`;

    let translation;

    if (!localPath || !componentName) {
      translation = "";
    } else if (params?.isNested) {
      translation = teGlobal(globalPath) ? tmGlobal(globalPath) : tm(localPath);
    } else {
      translation = teGlobal(globalPath) ? tGlobal(globalPath) : t(localPath);
    }

    return translation;
  }

  /**
   * Save the active language to the localStorage
   * @param lang
   */
  setActiveLanguage = (lang) => {
    const localeKey = I18nService.LOCALE_KEY;

    this.i18nInstance.global.locale.value = lang;
    localStorage.setItem(localeKey, lang);

    this.setMessages();
  };

  /**
   * Get the current active language from localStorage or set default if non exist
   * @returns {string | string}
   */
  getActiveLanguage = () => {
    const localeKey = I18nService.LOCALE_KEY;

    return localStorage.getItem(localeKey) || this._fallbackLocale;
  };
}

const i18nService = new I18nService({ fallbackLocale: "en" });
const { i18nInstance } = i18nService;
const i18n = i18nInstance.global;

export default i18nService;

export { i18n, i18nInstance };
