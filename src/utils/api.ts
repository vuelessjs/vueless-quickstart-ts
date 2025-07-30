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

class ApiService {
  pendingRequests = new Map();

  /**
   * Cancels all requests which includes given resource and method.
   *
   * @param {string} resource - Endpoint string.
   * @param {('GET'|'POST'|'PATCH'|'DELETE'|'PUT')} [method] - HTTP method.
   */
  cancelPendingRequestsByResource(resource, method) {
    const resourceWithoutQuery = resource.split("?").at(0);

    const targetKeys = this.pendingRequests.keys().filter((key) => {
      const keyWithoutQuery = key.split("?").at(0);

      if (method) {
        return keyWithoutQuery === `${method}:${resourceWithoutQuery}`;
      }

      return keyWithoutQuery === resourceWithoutQuery;
    });

    targetKeys.forEach((key) => {
      this.pendingRequests.get(key).abort();
      this.pendingRequests.delete(key);
    });
  }

  cancelPendingRequests() {
    this.pendingRequests.values().forEach((controller) => controller.abort());
    this.pendingRequests = new Map();
  }

  /**
   * Inits axios
   */
  init() {
    const restApiPrefix = import.meta.env.VITE_REST_API_PREFIX;
    const apiBaseUrl = import.meta.env.VITE_API_DOMAIN;

    axios.defaults.baseURL = apiBaseUrl + restApiPrefix;

    this.setAxiosInterceptors(axios);
  }

  /**
   * Converts all keys in an object or array from snake_case to camelCase.
   *
   * @param {Object|Array} obj - The object or array to convert.
   * @returns {Object|Array} - The new object or array with camelCase keys.
   */
  keysToCamelCase(obj) {
    if (isArray(obj)) {
      return obj.map((v) => this.keysToCamelCase(v));
    } else if (isObject(obj)) {
      return Object.entries(obj).reduce((result, [key, value]) => {
        const newKey = key.includes("_") ? camelCase(key) : key;

        result[newKey] = this.keysToCamelCase(value);

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
  keysToSnakeCase(obj) {
    if (isArray(obj)) {
      return obj.map((v) => this.keysToSnakeCase(v));
    } else if (isObject(obj)) {
      return reduce(
        obj,
        (result, value, key) => {
          result[snakeCase(key)] = this.keysToSnakeCase(value);

          return result;
        },
        {},
      );
    }

    return obj;
  }

  urlQueryToSnakeCase(url) {
    const [baseUrl, queries] = url.split("?");

    if (!queries) return url;

    const parsed = QS.parse(queries, qsOptions);
    const snakeCased = this.keysToSnakeCase(parsed);
    const snakeCaseQueries = QS.stringify(snakeCased, qsOptions);

    return `${baseUrl}?${snakeCaseQueries}`;
  }

  /**
   * Set axios interceptors
   * @param { Object } $axios
   */
  setAxiosInterceptors($axios) {
    $axios.interceptors.response.use(
      (response) => {
        this.loader("off", response.config?.url);

        if (response.data) {
          response.data = this.keysToCamelCase(response.data);
        }

        return response;
      },
      async (error) => {
        const { config, response, message } = error;
        const apiMessage = this.getResponseMessage(response);

        this.loader("off", config?.url);

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
      request.url = this.urlQueryToSnakeCase(request.url);

      if (request.data && !(request.data instanceof FormData)) {
        request.data = this.keysToSnakeCase(request.data);
      }

      return request;
    });
  }

  /**
   * Get message code for global notification
   * @param { Object } response
   * @returns String
   */
  getResponseMessage(response) {
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
  showSuccessNotify(message, withDelay) {
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
  loader(state, resource) {
    // console.log(state, resource);
    if (state === "on") loaderProgressOn(resource);
    if (state === "off") loaderProgressOff(resource);
  }

  /**
   * Get axios request config (method for redeclaration)
   * @param { Object } settings
   * @returns { Object }
   */
  getRequestConfig(settings) {
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
  get(resource, settings = {}) {
    const abortController = new AbortController();
    const config = this.getRequestConfig({
      ...settings,
      signal: abortController.signal,
    });
    const { withLoader = true, withNotify = false, delaySuccessNotify = false } = settings;

    this.cancelPendingRequestsByResource(resource, "GET");

    this.pendingRequests.set(`GET:${resource}`, abortController);

    if (withLoader) {
      this.loader("on", resource);
    }

    return axios.get(resource, config).then((response) => {
      this.pendingRequests.delete(resource);

      if (withNotify) {
        const message = this.getResponseMessage(response);

        this.showSuccessNotify(message, delaySuccessNotify);
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
  post(resource, params = null, settings = {}) {
    const config = this.getRequestConfig(settings);
    const { withLoader = true, withNotify = false, delaySuccessNotify = false } = settings;

    if (withLoader) {
      this.loader("on", resource);
    }

    return axios.post(resource, params, config).then((response) => {
      if (withNotify) {
        const message = this.getResponseMessage(response);

        this.showSuccessNotify(message, delaySuccessNotify);
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
  put(resource, params = null, settings = {}) {
    const config = this.getRequestConfig(settings);
    const { withLoader = true, withNotify = false, delaySuccessNotify = false } = settings;

    if (withLoader) {
      this.loader("on", resource);
    }

    return axios.put(resource, params, config).then((response) => {
      if (withNotify) {
        const message = this.getResponseMessage(response);

        this.showSuccessNotify(message, delaySuccessNotify);
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
  patch(resource, params = null, settings = {}) {
    const config = this.getRequestConfig(settings);
    const { withLoader = true, withNotify = false, delaySuccessNotify = false } = settings;

    if (withLoader) {
      this.loader("on", resource);
    }

    return axios.patch(resource, params, config).then((response) => {
      if (withNotify) {
        const message = this.getResponseMessage(response);

        this.showSuccessNotify(message, delaySuccessNotify);
      }

      return response;
    });
  }

  /**
   * Send the DELETE HTTP request
   * @param { String } resource
   * @param { Object } settings
   * @returns { IDBRequest<IDBValidKey> | Promise<void> }
   */
  delete(resource, settings = {}) {
    const config = this.getRequestConfig(settings);
    const { withLoader = true, withNotify = false, delaySuccessNotify = false } = settings;

    if (withLoader) {
      this.loader("on", resource);
    }

    return axios.delete(resource, config).then((response) => {
      if (withNotify) {
        const message = this.getResponseMessage(response);

        this.showSuccessNotify(message, delaySuccessNotify);
      }

      return response;
    });
  }
}

export default new ApiService();
