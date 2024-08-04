import MongoData from "@/core/MongoData";
import VM from "@/core/VM";
import _ from "lodash";
import moment from "moment";
import parser from "cron-parser";
import type { NextApiRequest, NextApiResponse } from "next";
import { ResponseData } from "@/core/ApiResponse";

const scheduleMap: Record<string, string[]> = {};
const futureCallMap: Record<string, Date[]> = {};
const maxIdleTime = 10_000;

/**
 * Creates a function that executes the given callback function only once
 * after a specified delay has passed since the last time the function was
 * called.
 *
 * @param {Function} fn - The callback function to be executed.
 * @param {number} delay - The delay in milliseconds.
 * @return {Function} The wrapped function.
 */
function useOnceAt(fn: () => void, delay: number) {
  // The timestamp of the last function call.
  let lastCall = 0;

  /**
   * The wrapped function that checks if the specified delay has passed since
   * the last function call and executes the callback function if so.
   *
   * @return {void}
   */
  return function() {
    // Get the current timestamp.
    const now = Date.now();

    // Check if the delay has passed since the last function call.
    if (now - lastCall >= delay) {
      // Execute the callback function.
      fn();

      // Update the timestamp of the last function call.
      lastCall = now;
    }
  };
}

/**
 * Creates a function that executes the given callback function at the
 * beginning of the next second.
 *
 * @param {Function} fn - The callback function to be executed.
 * @return {Function} The wrapped function.
 */
function useSyncTimeCall(fn: () => void) {
  return function() {
    /**
     * The amount of milliseconds left until the next second.
     * @type {number}
     */
    const millisecondsToNextSecond = 1000 - (new Date()).getMilliseconds();
    
    /**
     * Executes the given callback function at the beginning of the next second.
     *
     * @return {void}
     */
    setTimeout(fn, millisecondsToNextSecond);
  };
}




const scheduleDebauncer = useOnceAt(() => {
  MongoData.indexObjects().then((result) => {
    for (const item of result) {
      if (item.id == undefined) continue;
      if (item.schedule == undefined) continue;
      scheduleMap[item.objectHash] = item.schedule;
    }
  });
}, 10_000);

const executorShedule = useOnceAt(() => {
  for (const objectHash in scheduleMap) {
    let taskArray = scheduleMap[objectHash];
    if (!_.isArray(scheduleMap[objectHash]) && typeof scheduleMap[objectHash] == "string"){
      taskArray = [scheduleMap[objectHash]];
    }

    if (futureCallMap[objectHash] != undefined) {
      for (const callTime of futureCallMap[objectHash]) {
        const callTimeWindow = moment().diff(callTime, 'seconds');

        if (Math.abs(callTimeWindow) <= maxIdleTime / 1000) {
          useSyncTimeCall(() => {
            VM.ofObjectHash(objectHash).then(async (result) => {
              await MongoData.insertCall({
                ...result,
                time: moment().toDate(),
                objectHash: objectHash,
                callId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                isScheduled: false
              });
            });
          })();

          futureCallMap[objectHash] = futureCallMap[objectHash].filter((time) => time != callTime);
        }
      }
    }
  }
}, maxIdleTime)

const callDebauncer = useOnceAt(() => {
  lastCallStack = new Date();

  executorShedule();

  for (const objectHash in scheduleMap) {
    let taskArray = scheduleMap[objectHash];
    if (!_.isArray(scheduleMap[objectHash]) && typeof scheduleMap[objectHash] == "string"){
      taskArray = [scheduleMap[objectHash]];
    }

    futureCallMap[objectHash] = [];

    for (const task of taskArray) {
      if (task == undefined) continue;
      if (task == "") continue;

      try {
        const nextCall = parser.parseExpression(task).next().toDate()
        futureCallMap[objectHash].push(nextCall);
      } catch (error) {
      }
    }
  }

  scheduleDebauncer();
}, 1000);

let lastCallStack = new Date();

export interface WorkerStatus {
  lastCall: Date;
  now: Date;
  idleSeconds: number;
  isIdle: boolean;
  scheduleMap: Record<string, string[]>;
  futureCallMap: Record<string, Date[]>
}

/**
 * A simple API endpoint that responds with a JSON object containing a message.
 * This endpoint is used to test the API functionality of Next.js.
 *
 * @param {NextApiRequest} req - the request object
 * @param {NextApiResponse<ResponseData>} res - the response object
 * @returns {Promise<void>} - a promise that resolves when the response has been sent
 */
export default async function handler(
  req: NextApiRequest, // the request object
  res: NextApiResponse<ResponseData<any>> // the response object
): Promise<void> {
  if (req.method === "POST") {
    callDebauncer();

    res.status(200).json({
      code: 200,
      isError: false,
      data: "Debouncer called",
    });
    return;
  }

  if (req.method === "GET") {
    const now = new Date();
    res.status(200).json({
      code: 200,
      isError: false,
      data: {
        lastCall: lastCallStack,
        now: now,
        idleSeconds: moment(now).diff(moment(lastCallStack), "seconds"),
        isIdle: moment(now).diff(moment(lastCallStack), "seconds") > maxIdleTime / 1000,
        scheduleMap,
        futureCallMap
      },
    });
    return;
  }

  return;
}
