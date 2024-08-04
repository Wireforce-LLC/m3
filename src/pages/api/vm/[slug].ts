import MongoData from "@/core/MongoData";
import VM from "@/core/VM";
import moment from "moment";
import type { NextApiRequest, NextApiResponse } from "next";
import { ResponseData } from "@/core/ApiResponse";

 
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
) {
  const isDebug = Boolean(req.query.isDebug == "true");
  const result = await VM.ofObjectHash(req.query.slug as string, isDebug);

  if (result == null) {
    return res.status(404).json({ 
      code: 404,
      isError: true,
      data: "Object not found"
    });
  }

  await MongoData.insertCall({
    ...result,
    time: moment().toDate(),
    objectHash: req.query.slug as string,
    callId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    isScheduled: false
  });

  // set the HTTP status code and send a JSON response with the message
  return res.status(200).json({ 
    code: 200,
    isError: false,
    data: result
  });
}
