import { cloneDeep, merge } from "lodash-es";

import { FALLBACK_LOCALE } from "./i18n";

interface LocaleMessages {
  [key: string]: string | LocaleMessages;
}

interface ModuleLocales {
  [moduleName: string]: LocaleMessages;
}

interface GlobalMessages {
  [locale: string]: LocaleMessages;
}

interface ModuleMessages {
  [locale: string]: ModuleLocales;
}

interface ImportedLocale {
  default: LocaleMessages;
}

const globalMessages: GlobalMessages = {};
const moduleMessages: ModuleMessages = {};

const globalLocales = import.meta.glob("@/i18n/**/*.yaml");

for (const path in globalLocales) {
  const locales = (await globalLocales[path]()) as ImportedLocale;
  const pathParts = path.split(".");
  const langPart = pathParts.shift()?.split("/").pop();

  if (langPart) {
    globalMessages[langPart] = locales.default;
  }
}

const modules = import.meta.glob("@/modules/**/*.yaml");

for (const path in modules) {
  const locales = (await modules[path]()) as ImportedLocale;
  const pathParts = path.split(".");
  const langPart = pathParts.shift()?.split("/").pop();
  const moduleParts = path.split("modules").pop()?.split("/");
  const module = moduleParts?.at(1);

  if (langPart && module) {
    if (!moduleMessages[langPart]) {
      moduleMessages[langPart] = {};
    }

    moduleMessages[langPart][module] = locales.default;
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
// TODO: Check if it works correctly. Show module that caused warning
function validateLocaleDifference(messages: LocaleMessages, module: string, lang: string): void {
  if (sessionStorage.getItem("localeKeysDiff")) {
    sessionStorage.removeItem("localeKeysDiff");

    return;
  }

  const fallbackModuleMessages = moduleMessages[FALLBACK_LOCALE]?.[module];
  const fallbackGlobalMessages = globalMessages[FALLBACK_LOCALE];

  const fallbackMessages =
    fallbackModuleMessages && fallbackGlobalMessages
      ? merge(fallbackModuleMessages, fallbackGlobalMessages)
      : fallbackGlobalMessages || {};

  const diffKeys = compareKeys(messages, fallbackMessages);
  const message = `There are keys difference between "${FALLBACK_LOCALE}" and "${lang}" locales:`;

  // eslint-disable-next-line no-console
  if (diffKeys.length) console.warn(message, diffKeys);

  sessionStorage.setItem("localeKeysDiff", "true");
}

function compareKeys(obj1: LocaleMessages, obj2: LocaleMessages, path = ""): string[] {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const uniqueKeys = new Set([...keys1, ...keys2]);

  let diffPaths: string[] = [];

  uniqueKeys.forEach((key) => {
    const newPath = path ? `${path}.${key}` : key;

    if (!(key in obj1) || !(key in obj2)) {
      diffPaths.push(newPath);
    } else if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
      const nestedDiffs = compareKeys(obj1[key], obj2[key], newPath);

      diffPaths = diffPaths.concat(nestedDiffs);
    }
  });

  return diffPaths;
}

function validateModuleLocaleKeysOrder(module: string, fallbackLocale: string): void {
  Object.keys(moduleMessages).forEach((locale) => {
    if (locale === fallbackLocale || !moduleMessages[locale] || !moduleMessages[locale][module]) {
      return;
    }

    const orderWarnings = compareObjectKeysOrder(
      moduleMessages[fallbackLocale][module],
      moduleMessages[locale][module],
    );

    if (orderWarnings.length) {
      // eslint-disable-next-line no-console
      console.warn(
        `There are key order differences between "${fallbackLocale}" and "${locale}" locales:`,
        orderWarnings,
      );
    }
  });
}

function compareObjectKeysOrder(obj1: LocaleMessages, obj2: LocaleMessages, path = ""): string[] {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  let orderWarnings: string[] = [];

  keys1.forEach((key, index) => {
    const newPath = path ? `${path}.${key}` : key;

    if (keys2[index] !== key) {
      orderWarnings.push(newPath);
    }

    if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
      const nestedOrderWarnings = compareObjectKeysOrder(obj1[key], obj2[key], newPath);

      orderWarnings = orderWarnings.concat(nestedOrderWarnings);
    }
  });

  return orderWarnings;
}

export function validateModuleLocaleMassages(module: string, currentLocale: string) {
  const messages = moduleMessages[currentLocale]
    ? merge(cloneDeep(moduleMessages[currentLocale][module]), globalMessages[currentLocale])
    : globalMessages[currentLocale];

  validateLocaleDifference(messages, module, currentLocale);
  validateModuleLocaleKeysOrder(module, currentLocale);
}
