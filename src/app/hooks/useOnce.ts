import md5 from "md5";
import moment from "moment";
import { useCallback, useRef } from "react";

declare global {
  interface Window {
    __onces: any;
  }
}

const useOnce = (callback: Function): any => {
  const hasRunRef = useRef(false);

  const onceFunction = useCallback(
    function () {
      if (typeof window === "undefined") {
        throw new Error("useOnce can only be used in the browser");
      }

      const cursor = md5(callback.toString());

      if (typeof window.__onces == "undefined") {
        window.__onces = {};
      }

      if (typeof window.__onces[cursor] !== "undefined") {
        return;
      }

      if (typeof window.__onces[cursor] == "undefined") {
        window.__onces[cursor] = moment().unix();
      }

      if (!hasRunRef.current) {
        hasRunRef.current = true;
        // @ts-ignore
        callback(...arguments);
      }
    },
    [callback]
  );

  return onceFunction;
};

export default useOnce;
