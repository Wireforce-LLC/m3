import MongoData from "@/core/MongoData";
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
export default function handler(
  req: NextApiRequest, // the request object
  res: NextApiResponse<ResponseData<any>> // the response object
) {
    MongoData.selectCall(req.query.slug as string).then((call) => {
        res.status(200).json({ 
            code: 200,
            isError: false,
            data: call
        });
    })
}
