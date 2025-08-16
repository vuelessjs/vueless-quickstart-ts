import QS from "qs";
import axios from "axios";
import { camelCase, snakeCase, isArray, isObject } from "lodash-es";
import {
  notifySuccess,
  notifyError,
  setDelayedNotify,
  loaderProgressOn,
  loaderProgressOff,
  NotificationType,
} from "vueless";

import type { IStringifyOptions } from "qs";
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
type NotifyMessage = { label?: string; description: string };

type AppAxiosRequestConfig = AxiosRequestConfig & {
  allowMultipleRequests?: boolean;
  disableErrorNotify?: boolean;
};

type RequestSettings = Partial<AppAxiosRequestConfig> & {
  withLoader?: boolean;
  withNotify?: boolean;
  delaySuccessNotify?: boolean;
};

type HttpInitOptions = {
  apiBaseUrl?: string;
  restApiPrefix?: string;
  baseUrl?: string;
};

const qsOptions: IStringifyOptions = {
  arrayFormat: "repeat",
  encode: false,
};

const pendingRequests = new Map<string, AbortController>();

/**
 * Inits axios
 */
function apiInit(options: HttpInitOptions) {
  const { baseUrl = "" } = options;

  axios.defaults.baseURL = baseUrl;

  setAxiosInterceptors(axios);
}

/**
 * Change loader state.
 */
function loader(state: "on" | "off", resource: string) {
  if (state === "on") loaderProgressOn(resource);
  if (state === "off") loaderProgressOff(resource);
}

/**
 * Show success notify or set notify type and message in local storage for display with delay
 */
function showSuccessNotify(data: AxiosResponse["data"], withDelay: boolean = false) {
  /* Retrieve message from response. */
  const message = data.message;

  withDelay
    ? setDelayedNotify({ type: NotificationType.Success, description: message })
    : notifySuccess({ description: message });
}

/**
 * Get error message code for global notification.
 */
function getErrorResponseMessages(data?: AxiosResponse["data"]): NotifyMessage[] {
  if (Array.isArray(data)) {
    return [{ description: data.join(", ") }];
  }

  return Object.entries(data).map(([label, description]) => ({
    label: label ? label[0].toUpperCase() + label.slice(1) : undefined,
    description: Array.isArray(description) ? description.join(", ") : String(description),
  }));
}

/**
 * Set axios interceptors.
 */
function setAxiosInterceptors($axios: AxiosInstance) {
  $axios.interceptors.response.use(
    (response: AxiosResponse) => {
      loader("off", response.config?.url || "");

      if (response.data) {
        response.data = keysToCamelCase(response.data);
      }

      return response;
    },
    async (error: AxiosError) => {
      const { config, response, message } = error;
      const apiMessage = getErrorResponseMessages(response?.data);

      loader("off", config?.url || "");

      // show error notification if it isn't disabled in partiular api request
      if (!(config as AppAxiosRequestConfig)?.disableErrorNotify) {
        message === "Network Error"
          ? notifyError({ label: message })
          : apiMessage.forEach((message) => notifyError(message));
      }

      return Promise.reject(error);
    },
  );

  $axios.interceptors.request.use(async (request: InternalAxiosRequestConfig) => {
    const accessToken = ""; // your access token

    request.headers.Authorization = `Bearer ${accessToken}`;
    request.url = urlQueryToSnakeCase(request.url || "");

    if (request.data && !(request.data instanceof FormData)) {
      request.data = keysToSnakeCase(request.data);
    }

    return request;
  });
}

/**
 * Cancels all requests that include a given resource and method.
 */
function cancelPendingRequestsByResource(resource: string, method?: HttpMethod) {
  const [resourceWithoutQuery] = resource.split("?");

  const targetKeys = Array.from(pendingRequests.keys()).filter((key) => {
    const [keyWithoutQuery] = key.split("?");

    return method
      ? keyWithoutQuery === `${method}:${resourceWithoutQuery}`
      : keyWithoutQuery === resourceWithoutQuery;
  });

  targetKeys.forEach((key) => {
    const controller = pendingRequests.get(key);

    if (controller) {
      controller.abort();
    }

    pendingRequests.delete(key);
  });
}

/**
 * Cancels all pending requests.
 */
function cancelPendingRequests() {
  Array.from(pendingRequests.values()).forEach((controller) => controller.abort());

  pendingRequests.clear();
}

/**
 * Converts all keys in an object or array from snake_case to camelCase.
 */
function keysToCamelCase(data: unknown): unknown {
  if (isArray(data)) {
    return data.map((v) => keysToCamelCase(v));
  } else if (isObject(data)) {
    const entries = Object.entries(data).map(([key, value]) => {
      const newKey = key.includes("_") ? camelCase(key) : key;

      return [newKey, keysToCamelCase(value)];
    });

    return Object.fromEntries(entries);
  }

  return data;
}

/**
 * Converts all keys in an object or array from camelCase to snake_case.
 */
function keysToSnakeCase(data: unknown): unknown {
  if (isArray(data)) {
    return data.map((v) => keysToSnakeCase(v));
  } else if (isObject(data)) {
    const entries = Object.entries(data).map(([key, value]) => {
      return [snakeCase(String(key)), keysToSnakeCase(value)];
    });

    return Object.fromEntries(entries);
  }

  return data;
}

/**
 * Converts all keys in a query string from camelCase to snake_case.
 */
function urlQueryToSnakeCase(url: string) {
  const [baseUrl, queries] = url.split("?");

  if (!queries) return url;

  const parsed = QS.parse(queries, qsOptions);
  const snakeCased = keysToSnakeCase(parsed);
  const snakeCaseQueries = QS.stringify(snakeCased, qsOptions);

  return `${baseUrl}?${snakeCaseQueries}`;
}

/**
 * Get axios request config (method for redeclaration)
 */
function getRequestConfig(options: Partial<AppAxiosRequestConfig> = {}) {
  const config: AppAxiosRequestConfig = {
    baseURL: axios.defaults.baseURL,
  };

  if (options.allowMultipleRequests) {
    config.allowMultipleRequests = options.allowMultipleRequests;
  }

  if (options.disableErrorNotify) {
    config.disableErrorNotify = options.disableErrorNotify;
  }

  if (options.signal) {
    config.signal = options.signal;
  }

  return config;
}

/**
 * Send the GET HTTP request
 */
async function apiGet(resource: string, options: RequestSettings = {}) {
  cancelPendingRequestsByResource(resource, "GET");

  if (options.withLoader) {
    loader("on", resource);
  }

  const abortController = new AbortController();
  const config = getRequestConfig({ ...options, signal: abortController.signal });

  pendingRequests.set(`GET:${resource}`, abortController);

  const response = await axios.get(resource, config);

  pendingRequests.delete(`GET:${resource}`);

  if (options.withNotify) {
    showSuccessNotify(response?.data, options.delaySuccessNotify);
  }

  return response;
}

/**
 * Set the POST HTTP request
 */
async function apiPost(resource: string, params: unknown = null, options: RequestSettings = {}) {
  if (options.withLoader) {
    loader("on", resource);
  }

  const config = getRequestConfig(options);
  const response = await axios.post(resource, params, config);

  if (options.withNotify) {
    showSuccessNotify(response?.data, options.delaySuccessNotify);
  }

  return response;
}

/**
 * Send the PUT HTTP request
 */
async function apiPut(resource: string, params: unknown = null, options: RequestSettings = {}) {
  if (options.withLoader) {
    loader("on", resource);
  }

  const config = getRequestConfig(options);
  const response = await axios.put(resource, params, config);

  if (options.withNotify) {
    showSuccessNotify(response?.data, options.delaySuccessNotify);
  }

  return response;
}

/**
 * Send the PATCH HTTP request
 */
async function apiPatch(resource: string, params: unknown = null, options: RequestSettings = {}) {
  if (options.withLoader) {
    loader("on", resource);
  }

  const config = getRequestConfig(options);
  const response = await axios.patch(resource, params, config);

  if (options.withNotify) {
    showSuccessNotify(response?.data, options.delaySuccessNotify);
  }

  return response;
}

/**
 * Send the DELETE HTTP request
 */
async function apiDelete(resource: string, options: RequestSettings = {}) {
  if (options.withLoader) {
    loader("on", resource);
  }

  const config = getRequestConfig(options);
  const response = await axios.delete(resource, config);

  if (options.withNotify) {
    showSuccessNotify(response?.data, options.delaySuccessNotify);
  }

  return response;
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
