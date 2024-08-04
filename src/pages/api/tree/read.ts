import type { NextApiRequest, NextApiResponse } from "next";
import { ResponseData } from "@/core/ApiResponse";
import { Tree } from "@/core/Tree";

 
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
  const lookablePath = req.query.path;

  if (!lookablePath || typeof lookablePath != 'string') {
    return res.status(400).json({
      code: 400,
      isError: true,
      data: "You must provide a path to look for in 'path' query parameter"
    });
  }

  const tree = new Tree();
  const content = await tree.safeReadFile(lookablePath);

  // set the HTTP status code and send a JSON response with the message
  return res.status(200).json({
    code: 200,
    isError: false,
    data: content
  });
}
