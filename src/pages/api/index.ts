import type { NextApiRequest, NextApiResponse } from "next";

 
type ResponseData = {
  message: string
}
 
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
  res: NextApiResponse<ResponseData> // the response object
) {
  // set the HTTP status code and send a JSON response with the message
  return res.status(200).json({ message: 'Hello from Next.js!' });
}
