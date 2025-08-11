import { camelCase, snakeCase, isArray, isObject, reduce } from "lodash-es";
import {
  notifySuccess,
  notifyError,
  setDelayedNotify,
  loaderProgressOn,
  loaderProgressOff,
} from "vueless";
import QS from "qs";
import axios from "axios";

import type { NotificationType } from "vueless/ui.text-notify/constants";

export const qsOptions = {
  arrayFormat: "repeat",
  encode: false,
};

const pendingRequests = new Map();

/**
 * Cancels all requests which includes given resource and method.
 *
 * @param {string} resource - Endpoint string.
 * @param {('GET'|'POST'|'PATCH'|'DELETE'|'PUT')} [method] - HTTP method.
 */
function cancelPendingRequestsByResource(resource: string, method) {
  const resourceWithoutQuery = resource.split("?").at(0);

  const targetKeys = Array.from(pendingRequests.keys()).filter((key) => {
    const keyWithoutQuery = key.split("?").at(0);

    if (method) {
      return keyWithoutQuery === `${method}:${resourceWithoutQuery}`;
    }

    return keyWithoutQuery === resourceWithoutQuery;
  });

  targetKeys.forEach((key) => {
    pendingRequests.get(key).abort();
    pendingRequests.delete(key);
  });
}

function cancelPendingRequests() {
  Array.from(pendingRequests.values()).forEach((controller) => controller.abort());
  pendingRequests.clear();
}

/**
 * Inits axios
 */
function apiInit() {
  const restApiPrefix = import.meta.env.VITE_REST_API_PREFIX;
  const apiBaseUrl = import.meta.env.VITE_API_DOMAIN;

  axios.defaults.baseURL = apiBaseUrl + restApiPrefix;

  setAxiosInterceptors(axios);
}

/**
 * Converts all keys in an object or array from snake_case to camelCase.
 *
 * @param {Object|Array} obj - The object or array to convert.
 * @returns {Object|Array} - The new object or array with camelCase keys.
 */
function keysToCamelCase(obj) {
  if (isArray(obj)) {
    return obj.map((v) => keysToCamelCase(v));
  } else if (isObject(obj)) {
    return Object.entries(obj).reduce((result, [key, value]) => {
      const newKey = key.includes("_") ? camelCase(key) : key;

      result[newKey] = keysToCamelCase(value);

      return result;
    }, {});
  }

  return obj;
}

/**
 * Converts all keys in an object or array from camelCase to snake_case.
 *
 * @param {Object|Array} obj - The object or array to convert.
 * @returns {Object|Array} - The new object or array with snake_case keys.
 */
function keysToSnakeCase(obj) {
  if (isArray(obj)) {
    return obj.map((v) => keysToSnakeCase(v));
  } else if (isObject(obj)) {
    return reduce(
      obj,
      (result, value, key) => {
        result[snakeCase(key)] = keysToSnakeCase(value);

        return result;
      },
      {},
    );
  }

  return obj;
}

function urlQueryToSnakeCase(url) {
  const [baseUrl, queries] = url.split("?");

  if (!queries) return url;

  const parsed = QS.parse(queries, qsOptions);
  const snakeCased = keysToSnakeCase(parsed);
  const snakeCaseQueries = QS.stringify(snakeCased, qsOptions);

  return `${baseUrl}?${snakeCaseQueries}`;
}

/**
 * Set axios interceptors
 * @param { Object } $axios
 */
function setAxiosInterceptors($axios) {
  $axios.interceptors.response.use(
    (response) => {
      loader("off", response.config?.url);

      if (response.data) {
        response.data = keysToCamelCase(response.data);
      }

      return response;
    },
    async (error) => {
      const { config, response, message } = error;
      const apiMessage = getResponseMessage(response);

      loader("off", config?.url);

      // show error notification if it isn't disabled in partiular api request
      if (!config?.disableErrorNotify) {
        if (message === "Network Error") {
          notifyError({ label: message });
        } else {
          apiMessage.forEach((message) => notifyError(message));
        }
      }

      return Promise.reject(error);
    },
  );

  $axios.interceptors.request.use(async (request) => {
    const accessToken = ""; // your access token

    request.headers.Authorization = `Bearer ${accessToken}`;
    request.url = urlQueryToSnakeCase(request.url);

    if (request.data && !(request.data instanceof FormData)) {
      request.data = keysToSnakeCase(request.data);
    }

    return request;
  });
}

/**
 * Get message code for global notification
 * @param { Object } response
 * @returns String
 */
function getResponseMessage(response: string) {
  if (Array.isArray(response?.data)) {
    return [{ description: response?.data.join(", ") }];
  } else {
    return Object.entries(response?.data || {}).map(([label, description]) => ({
      label: label[0].toUpperCase() + label.slice(1),
      description: Array.isArray(description) ? description.join(", ") : description,
    }));
  }
}

/**
 * Show success notify or set type and message in local storage for display with delay
 * @param { String } message
 * @param { Boolean } withDelay
 */
function showSuccessNotify(message, withDelay) {
  if (withDelay) {
    setDelayedNotify({
      type: "success" as NotificationType,
      description: message,
    });
  } else {
    notifySuccess({ description: message });
  }
}

/**
 * Change loaders state (on | off)
 * @param { String } state
 * @param { String } resource
 */
function loader(state, resource: string) {
  // console.log(state, resource);
  if (state === "on") loaderProgressOn(resource);
  if (state === "off") loaderProgressOff(resource);
}

/**
 * Get axios request config (method for redeclaration)
 * @param { Object } settings
 * @returns { Object }
 */
function getRequestConfig(settings) {
  const {
    allowMultipleRequests = false,
    disableErrorNotify = false,
    signal = undefined,
  } = settings;

  const config = {
    baseURL: axios.defaults.baseURL,
  };

  if (allowMultipleRequests) {
    config.allowMultipleRequests = allowMultipleRequests;
  }

  if (disableErrorNotify) {
    config.disableErrorNotify = disableErrorNotify;
  }

  if (signal) {
    config.signal = signal;
  }

  return config;
}

/**
 * Send the GET HTTP request
 * @param { String } resource
 * @param { Object } settings
 * @returns { IDBRequest<IDBValidKey> | Promise<void> }
 */
function apiGet(resource: string, settings = {}) {
  const abortController = new AbortController();
  const config = getRequestConfig({
    ...settings,
    signal: abortController.signal,
  });
  const { withLoader = true, withNotify = false, delaySuccessNotify = false } = settings;

  cancelPendingRequestsByResource(resource, "GET");

  pendingRequests.set(`GET:${resource}`, abortController);

  if (withLoader) {
    loader("on", resource);
  }

  return axios.get(resource, config).then((response) => {
    pendingRequests.delete(resource);

    if (withNotify) {
      const message = getResponseMessage(response);

      showSuccessNotify(message, delaySuccessNotify);
    }

    return response;
  });
}

/**
 * Set the POST HTTP request
 * @param { String } resource
 * @param params
 * @param { Object } settings
 * @returns { IDBRequest<IDBValidKey> | Promise<void> }
 */
function apiPost(resource: string, params = null, settings = {}) {
  const config = getRequestConfig(settings);
  const { withLoader = true, withNotify = false, delaySuccessNotify = false } = settings;

  if (withLoader) {
    loader("on", resource);
  }

  return axios.post(resource, params, config).then((response) => {
    if (withNotify) {
      const message = getResponseMessage(response);

      showSuccessNotify(message, delaySuccessNotify);
    }

    return response;
  });
}

/**
 * Send the PUT HTTP request
 * @param { String } resource
 * @param params
 * @param { Object } settings
 * @returns {IDBRequest<IDBValidKey> | Promise<void>}
 */
function apiPut(resource: string, params = null, settings = {}) {
  const config = getRequestConfig(settings);
  const { withLoader = true, withNotify = false, delaySuccessNotify = false } = settings;

  if (withLoader) {
    loader("on", resource);
  }

  return axios.put(resource, params, config).then((response) => {
    if (withNotify) {
      const message = getResponseMessage(response);

      showSuccessNotify(message, delaySuccessNotify);
    }

    return response;
  });
}

/**
 * Send the PATCH HTTP request
 * @param { String } resource
 * @param params
 * @param { Object } settings
 * @returns { IDBRequest<IDBValidKey> | Promise<void> }
 */
function apiPatch(resource: string, params = null, settings = {}) {
  const config = getRequestConfig(settings);
  const { withLoader = true, withNotify = false, delaySuccessNotify = false } = settings;

  if (withLoader) {
    loader("on", resource);
  }

  return axios.patch(resource, params, config).then((response) => {
    if (withNotify) {
      const message = getResponseMessage(response);

      showSuccessNotify(message, delaySuccessNotify);
    }

    return response;
  });
}

/**
 * Send the DELETE HTTP request
 */
function apiDelete(resource: string, settings = {}) {
  const config = getRequestConfig(settings);
  const { withLoader = true, withNotify = false, delaySuccessNotify = false } = settings;

  if (withLoader) {
    loader("on", resource);
  }

  return axios.delete(resource, config).then((response) => {
    if (withNotify) {
      const message = getResponseMessage(response);

      showSuccessNotify(message, delaySuccessNotify);
    }

    return response;
  });
}

/**
 * HTTP client
 */
export const http = {
  init: apiInit,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  cancelPendingRequests,
};
