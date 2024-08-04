import Machine from "./Machine";
import MongoData from "./MongoData";
import Node from "./Node";
import _ from "lodash";
import axios, { AxiosRequestConfig } from "axios";
import md5 from "md5";
import moment, { Moment } from "moment";
import parser from "cron-parser";
import underscore from "underscore";
import v8 from "node:v8";
import vm from "node:vm";
import { serializeError } from "serialize-error";
import { Tree } from "./Tree";

interface Context extends vm.Context {}

interface DeclareObjectMeta {
  id?: string;
  name?: string;
  group?: string;
  description?: string;
  deps?: string[];
  schedule?: string[];
}

export interface ObjectMeta extends DeclareObjectMeta {
  objectHash: string;
  resultTypes: any;
}

export interface VME<T> {
  resultAsTyped?: T;
  error?: Error;
  context: vm.Context;
  performance: { millis: number };
  stdout: StdOut[];
  netTrace: NetTrace[];
  nodeTypes?: any;

  deps?: Record<string, VME<any>>;
}

export interface VMECall extends VME<any> {
  time: Date;
  objectHash: string;
  callId: string;
  isScheduled: boolean;
}

export interface StdOut {
  stdout: string;
  level: number;
  timestamp: Moment;
}

export interface NetTrace {
  timestamp: Moment;
  type: "request" | "response";
  axiosRequest: AxiosRequestConfig;
  data?: any;
}

export default class VM extends Machine {
  private cwoh = "";
  private tree = new Tree();
  private _cache = Buffer.from([]);
  private stdout: StdOut[] = [];
  private netTrace: NetTrace[] = [];
  private isDebug = false;

  // d31cc09fbd186c49b173c45896fd073b
  constructor(objectHash: string, isDebug: boolean) {
    super();
    this.cwoh = objectHash;
    this.isDebug = isDebug;
  }

  /**
   * Creates a VM instance with the provided object hash and spawns a script
   * using the object hash. Then evaluates the script and returns the result.
   *
   * @param {string} objectHash - The hash of the object to be used for the VM.
   * @returns {Promise<VME<T>>} - A promise that resolves to the evaluation result.
   */
  static async ofObjectHash(
    objectHash: string,
    isDebug = false
  ): Promise<VME<unknown>> {
    // Create a new VM instance with the provided object hash
    const vm = new VM(objectHash, isDebug);

    // Spawn a script using the object hash
    const script = await vm.spawnScript();

    // Evaluate the script and return the result
    return vm.evaluate(script);
  }

  /**
   * Creates a new context object for the virtual machine.
   * This context object is used to execute JavaScript code in the VM.
   *
   * @return {vm.Context} The newly created context object.
   */
  private createContext(): { obj: any; context: vm.Context } {
    const axiosClient = axios.create();
    const fetchProxy = async (input: RequestInfo | URL, init?: RequestInit) => {
      this.netTrace.push({
        timestamp: moment(),
        type: "request",
        axiosRequest: {
          url: input.toString(),
          method: init?.method || "GET",
        },
      });

      const response = await fetch(input, init);

      this.netTrace.push({
        timestamp: moment(),
        type: "response",
        axiosRequest: {
          url: input.toString(),
          method: init?.method || "GET",
        }
      });

      return response;
    };

    axiosClient.interceptors.request.use((config) => {
      this.netTrace.push({
        timestamp: moment(),
        type: "request",
        axiosRequest: config,
      });
      return config;
    });

    axiosClient.interceptors.response.use((response) => {
      this.netTrace.push({
        timestamp: moment(),
        type: "response",
        axiosRequest: response.config,
        data: response.data,
      });
      return response;
    });

    let context = {
      __meta_id: "",
      __deps_results: {},
      isDebug: this.isDebug,
      Unit: "Unit",
      axios: axiosClient,
      fetch: fetchProxy,
      moment: moment,
      _: underscore,

      resolve: (_: any) => {
        throw new Error("Not implemented");
      },

      // The current object hash stored in the VM instance.
      // This hash is used to identify the root object of the script.
      currentObject: this.cwoh,
      console: {
        log: (message: string) =>
          this.stdout.push({
            stdout:
              typeof message != "string"
                ? JSON.stringify(message)
                : String(message),
            level: 0,
            timestamp: moment(),
          }),
        error: (message: string) =>
          this.stdout.push({
            stdout:
              typeof message != "string"
                ? JSON.stringify(message)
                : String(message),
            level: 1,
            timestamp: moment(),
          }),
        warn: (message: string) =>
          this.stdout.push({
            stdout:
              typeof message != "string"
                ? JSON.stringify(message)
                : String(message),
            level: 2,
            timestamp: moment(),
          }),
        info: (message: string) =>
          this.stdout.push({
            stdout:
              typeof message != "string"
                ? JSON.stringify(message)
                : String(message),
            level: 3,
            timestamp: moment(),
          }),
        debug: (message: string) =>
          this.stdout.push({
            stdout:
              typeof message != "string"
                ? JSON.stringify(message)
                : String(message),
            level: 4,
            timestamp: moment(),
          }),
        trace: (message: string) =>
          this.stdout.push({
            stdout:
              typeof message != "string"
                ? JSON.stringify(message)
                : String(message),
            level: 5,
            timestamp: moment(),
          }),
      },

      async useDep(id: string) {
        if (context.isDebug === true) {
          return;
        }

        if (!context.__meta_id) {
          throw new Error(
            "Before you should call 'useMeta' and set the 'id' property"
          );
        }

        if (context.__meta_id == id) {
          throw new Error("Cyclic dependency detected");
        }

        const declaration = await (
          await MongoData.useObjectsCollection()
        ).findOne({ id });

        if (declaration === null) {
          throw new Error("Object not declared");
        }

        if (context.currentObject == declaration.objectHash) {
          throw new Error("Cyclic dependency detected");
        }

        const objectHash = declaration.objectHash;

        const result: VME<any> = await VM.ofObjectHash(objectHash);

        if (typeof context.__deps_results == "undefined") {
          context.__deps_results = {} as Record<string, VME<any>>;
        }

        // @ts-ignore
        context.__deps_results[id] = result;

        await MongoData.declateDep(context.currentObject, id);

        return { value: result.resultAsTyped, error: result.error };
      },

      async useFlow(callback: Function | (() => Promise<any>)) {
        if (context.isDebug === true) {
          context.resolve(undefined);
          return;
        }

        if (!context.__meta_id) {
          throw new Error(
            "Before you should call 'useMeta' and set the 'id' property"
          );
        }

        if (typeof callback == "function") {
          return await callback();
        }

        return await callback;
      },
      async useMeta(declare: DeclareObjectMeta) {
        if (context.__meta_id) {
          throw new Error("Looks like you've already called 'useMeta'. Only one meta is allowed per object");
        }

        if (declare.id == undefined) {
          throw new Error("The 'id' property is required");
        }

        if (_.isEmpty(declare.id.trim())) {
          throw new Error("The 'id' property can't be empty");
        }

        const declaration = {
          deps: [],
          ...(declare as DeclareObjectMeta),
          objectHash: String(context.currentObject),
          resultTypes: "Unknown",
        };

        if (declaration.schedule) {
          if (!Array.isArray(declaration.schedule)) {
            declaration.schedule = [declaration.schedule];
          }

          for (const schedule of declaration.schedule) {
            parser.parseExpression(schedule);
          }
        }

        context.__meta_id = declaration.id!!;

        await MongoData.declareObject(declaration);
      },
      async useLazy(it: Function) {
        const memKey = "lazy_" + md5(it.toString());

        if (Machine.lazyValues.get(memKey) == undefined) {
          Machine.lazyValues.set(memKey, await it());
        }

        return Machine.lazyValues.get(memKey);
      },
      async useMemo(it: Function, time = 60) {
        const memKey = "memo_" + md5(it.toString());
        const cached = Machine.cache.get(memKey);

        if (typeof cached == "undefined") {
          const calculated = await it();
          Machine.cache.set(memKey, calculated, time || 60);
          return calculated;
        }

        return Machine.cache.get(memKey);
      },
      sleep: (time: number) =>
        new Promise((resolve) => setTimeout(resolve, time)),
      setTimeout: () => new Error("setTimeout is not supported"),
      clearTimeout: () => new Error("clearTimeout is not supported"),
      setInterval: () => new Error("setInterval is not supported"),
      clearInterval: () => new Error("clearInterval is not supported"),
    };

    // Create a new context object with a single property:
    // - currentObject: a string representing the current object hash.
    return {
      obj: context,
      context: vm.createContext(context),
    };
  }

  /**
   * Spawns a new script by reading the object with the current object hash.
   * If the object is not found, an error is thrown.
   *
   * @return {vm.Script} The newly created script.
   * @throws {Error} If the object is not found.
   */
  public async spawnScript(): Promise<vm.Script> {
    // Read the object with the current object hash
    const raw = await this.tree.readByObjectHash(this.cwoh);

    // If the object is not found, throw an error
    if (!raw) {
      throw new Error("Object not found");
    }

    // Create a script using the raw object and return it
    const script = this.createScript(
      "(async (resolve) => {%segment%})".replace("%segment%", raw)
    );

    if (!script) {
      
      throw new Error("Failed to create script");
    }

    return script;
  }

  public createScript(source: string): vm.Script | null {
    v8.serialize("");
    try {
      const script = new vm.Script(source, {
        filename: "script.js",
      });

      script.cachedData = this._cache;
      return script;
    } catch (error) {
      return null;
    }
  }

  async evaluate<T>(script: vm.Script): Promise<VME<T>> {
    const { obj: context } = this.createContext();

    const opt: vm.RunningScriptInNewContextOptions = {
      contextName: "script",
      timeout: 10000,
      displayErrors: true,
      filename: "script.js",
    };

    var vmeFactory = {
      context,
      stdout: this.stdout,
      netTrace: this.netTrace,
    };

    var startTime = performance.now();

    return new Promise<VME<T>>(async (resolve, reject) => {
      const resolver = async (result: undefined | T | Promise<any>) => {
        let error = undefined;

        if (result instanceof Promise) {
          result = await result;
        }

        var endTime = performance.now();

        const vme = {
          resultAsTyped: result as T,
          nodeTypes: Node.getTypes(result as T),
          error,
          performance: { millis: endTime - startTime },
          ...vmeFactory,
        };

        const types = Node.getTypes(result);

        console.log("types", types, result);

        MongoData.declareResultTypes(context.currentObject, types);

        resolve(vme);
      };

      context.resolve = resolver;

      context.reject = (error: Error) => {
        var endTime = performance.now();

        const vme = {
          error,
          performance: { millis: endTime - startTime },
          nodeTypes: undefined,
          ...vmeFactory,
        };

        resolve(vme);
      };

      try {
        resolver(await (await script.runInNewContext(context, opt))(resolver));
      } catch (e: Error | any) {
        var endTime = performance.now();

        const vme = {
          resultAsTyped: undefined,
          error: serializeError(e),
          performance: { millis: endTime - startTime },
          ...vmeFactory,
        };

        resolve(vme);
      }
    });
  }
}
