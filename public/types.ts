//@ts-ignore
type DependencyLinker = $dependencies$;

interface AxiosRequestConfig {
    url: string;
    method?: string;
    data?: any;
    headers?: any;
}

interface AxiosResponse {
    data: any;
    status: number;
}

/**
 * A class that provides a wrapper around the Axios library.
 * Axios is a promise-based HTTP client for the browser and node.js.
 */
abstract class Axios {
    /**
     * Sends a GET request to the specified `url` with optional `config` object.
     *
     * @param {string} url The URL to send the GET request to.
     * @param {AxiosRequestConfig} [config] The configuration for the GET request.
     * @return {Promise<AxiosResponse>} A promise that resolves to the response of the GET request.
     */
    static get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return new Promise(() => {});
    }

    /**
     * Sends a POST request to the specified `url` with the given `data` and optional `config` object.
     *
     * @param {string} url The URL to send the POST request to.
     * @param {any} data The data to send as the request body.
     * @param {AxiosRequestConfig} [config] The configuration for the POST request.
     * @return {Promise<AxiosResponse>} A promise that resolves to the response of the POST request.
     */
    static post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return new Promise(() => {});
    }

    /**
     * Sends a PUT request to the specified `url` with the given `data` and optional `config` object.
     *
     * @param {string} url The URL to send the PUT request to.
     * @param {any} data The data to send as the request body.
     * @param {AxiosRequestConfig} [config] The configuration for the PUT request.
     * @return {Promise<AxiosResponse>} A promise that resolves to the response of the PUT request.
     */
    static put(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return new Promise(() => {});
    }

    /**
     * Sends a DELETE request to the specified `url` with optional `config` object.
     *
     * @param {string} url The URL to send the DELETE request to.
     * @param {AxiosRequestConfig} [config] The configuration for the DELETE request.
     * @return {Promise<AxiosResponse>} A promise that resolves to the response of the DELETE request.
     */
    static delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return new Promise(() => {});
    }
}

//@ts-ignore
const axios = Axios;

/**
 * Defines if the VM is in debug mode.
 */
const isDebug: boolean = false;

interface Meta {
  id: string;
  name?: string;
  group?: string;
  description?: string;
  deps?: string[];
  schedule?: string[];
}

/**
 * Asynchronously declares a meta object for the current object being executed in the VM.
 *
 * @param {Meta} meta - The meta object to declare. This object contains the following properties:
 *      - id: string - The identifier of the meta object.
 *      - name?: string - The name of the meta object (optional).
 *      - group?: string - The group that the meta object belongs to (optional).
 *      - description?: string - The description of the meta object (optional).
 *      - deps?: string[] - The dependencies of the meta object (optional).
 *      - schedule?: string[] - The schedule for the meta object (optional).
 * @throws {Error} - If the function is not implemented.
 */
async function useMeta(meta: Meta) {
  throw new Error("Function not implemented.");
}

/**
 * Asynchronously declares a dependency for the current object being executed in the VM.
 *
 * @param {string | DependencyLinker | $dependencies$} dep - The identifier of the dependency to declare.
 *      This could be a string representing the identifier of the dependency, an object of type
 *      DependencyLinker representing a custom dependency linker, or the special object $dependencies$
 *      representing the current dependencies of the current object.
 * @return {Promise<void>} A Promise that resolves when the declaration is complete.
 * @throws {Error} If the function is not implemented.
 */
//@ts-ignore
async function useDep(dep: $dependencies$): Promise<void> {
  throw new Error("Function not implemented.");
}

/**
 * Asynchronously declares a flow for the current object being executed in the VM.
 * useFlow should be returned
 * 
 * ```js
 * return useFlow(() => {
 *   // your code
 *   return "result"; // or resolve("result");
 * });
 * ```
 * 
 * @param {Function|(() => Promise<any>)} callback - The function or arrow function
 *      that represents the flow. This callback function can be either synchronous
 *      or asynchronous and can return any type of value.
 * 
 * @return {Promise<any>} A Promise that resolves to the result of the flow execution.
 * @throws {Error} If the function is not implemented.
 */
async function useFlow(
  callback: Function | (() => Promise<any>)
): Promise<any> {
  throw new Error("Function not implemented.");
}

/**
 * A function that terminates a virtual object and produces the result of the function execution.
 *
 * ```js
 * resolve("result");
 * resolve({ value: "result", error: null });
 * resolve(1234);
 * ```
 * 
 * @param {any} value - The value to be resolved. This could be any type of value.
 * @throws {Error} - If the function is not implemented.
 */
function resolve(value: any) {
  throw new Error("Function not implemented.");
}

/**
 * Asynchronously executes a function and caches the result for future use.
 * 
 * ```js
 * return useFlow(useMemo(async () => {
 *   // your code
 *   return "result";  
 * }, 1)) // cache for 1 second
 * ```
 * 
 * @param {Function} it - The function to be executed.
 * @param {number} - The time in seconds to store the result in cache.
 * @throws {Error} If the function is not implemented.
 * @return {Promise<any>} The result of the function execution.
 */
async function useMemo(it: Function, time = 60) {
  throw new Error("Function not implemented.");
}

/**
 * Asynchronously executes a function only once and when it is called for the first time.
 *
 * ```js
 * return useFlow(useLazy(async () => {
 *   // your code
 *   return "result";  
 * }))
 * ```
 * 
 * @param {Function} it - The function to be executed.
 * @throws {Error} If the function is not implemented.
 * @return {Promise<any>} The result of the function execution.
 */
async function useLazy(it: Function) {
  throw new Error("Function not implemented.");
}
