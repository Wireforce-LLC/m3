import MongoData from "@/core/MongoData";
import type { NextApiRequest, NextApiResponse } from "next";
import { ResponseData } from "@/core/ApiResponse";

/*
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

const short = Boolean(req.query.short) || false
  // set the HTTP status code and send a JSON response with the message
  const calls = await (await MongoData.useCallsCollection())
    .aggregate([
        {
            $sort: {
                time: -1
            },
        },
        { $replaceRoot: { newRoot: {
            time: "$time",
            callId: "$callId",
            nodeTypes: "$nodeTypes",
            result: "$resultAsTyped",
            pmillis: "$performance.millis",
        } } }
    ])
    .toArray()

  
  const reponse: ResponseData<any> = {
    code: 200,
    isError: false,
    data: calls,
  };

  // set the HTTP status code and send a JSON response with the message
  return res.status(200).json(reponse);
}
