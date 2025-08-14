import { cloneDeep, merge } from "lodash-es";

import { FALLBACK_LOCALE } from "./i18n";

interface Messages {
  [key: string]: string | Messages;
}

interface ModuleMessages {
  [key: string]: Messages;
}

const globalMessages: Messages = {};
const moduleMessages: ModuleMessages = {};

const globalLocales = import.meta.glob("@/i18n/**/*.yaml");

for (const path in globalLocales) {
  const { default: locales } = (await globalLocales[path]()) as Messages;
  const pathParts = path.split(".");
  const lang = pathParts.shift()?.split("/").pop();

  if (lang) {
    globalMessages[lang] = locales;
  }
}

const modules = import.meta.glob("@/modules/**/*.yaml");

for (const path in modules) {
  const pathParts = path.split(".");
  const lang = pathParts.shift()?.split("/").pop();
  const moduleParts = path.split("modules").pop()?.split("/");
  const module = moduleParts?.at(1);

  if (!lang || !module) {
    continue;
  }

  if (!moduleMessages[lang]) {
    moduleMessages[lang] = {};
  }
}

/**
 * Type guard to check if a value is a Messages object
 */
function isMessages(value: string | Messages): value is Messages {
  return typeof value === "object" && value !== null;
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
function validateLocaleDifference(messages: Messages, module: string, lang: string): void {
  if (sessionStorage.getItem("localeKeysDiff")) {
    sessionStorage.removeItem("localeKeysDiff");

    return;
  }

  const fallbackModuleMessages = moduleMessages[FALLBACK_LOCALE]?.[module];
  const fallbackGlobalMessages = globalMessages[FALLBACK_LOCALE];

  const fallbackModuleMsgs =
    fallbackModuleMessages && isMessages(fallbackModuleMessages) ? fallbackModuleMessages : {};

  const fallbackGlobalMsgs =
    fallbackGlobalMessages && isMessages(fallbackGlobalMessages) ? fallbackGlobalMessages : {};

  const fallbackMessages =
    Object.keys(fallbackModuleMsgs).length && Object.keys(fallbackGlobalMsgs).length
      ? merge(fallbackModuleMsgs, fallbackGlobalMsgs)
      : fallbackGlobalMsgs;

  const diffKeys = compareKeys(messages, fallbackMessages);
  const message = `There are keys difference between "${FALLBACK_LOCALE}" and "${lang}" locales:`;

  // eslint-disable-next-line no-console
  if (diffKeys.length) console.warn(message, diffKeys);

  sessionStorage.setItem("localeKeysDiff", "true");
}

function compareKeys(obj1: Messages, obj2: Messages, path = ""): string[] {
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

    const fallbackModule = moduleMessages[fallbackLocale][module];
    const currentModule = moduleMessages[locale][module];

    if (!isMessages(fallbackModule) || !isMessages(currentModule)) {
      return;
    }

    const orderWarnings = compareObjectKeysOrder(fallbackModule, currentModule);

    if (orderWarnings.length) {
      // eslint-disable-next-line no-console
      console.warn(
        `There are key order differences between "${fallbackLocale}" and "${locale}" locales:`,
        orderWarnings,
      );
    }
  });
}

function compareObjectKeysOrder(obj1: Messages, obj2: Messages, path = ""): string[] {
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
  const moduleMsg = moduleMessages[currentLocale]?.[module];
  const globalMsg = globalMessages[currentLocale];

  const isValidModuleMsg = moduleMsg && isMessages(moduleMsg);
  const isValidGlobalMsg = globalMsg && isMessages(globalMsg);

  let messages: Messages = {};

  if (isValidModuleMsg && isValidGlobalMsg) {
    messages = merge(cloneDeep(moduleMsg), globalMsg);
  } else if (isValidGlobalMsg) {
    messages = globalMsg;
  }

  validateLocaleDifference(messages, module, currentLocale);
  validateModuleLocaleKeysOrder(module, currentLocale);
}
