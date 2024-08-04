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
  const tree = new Tree();

  if (req.method != 'POST') {
    return res.status(400).json({
      code: 400,
      isError: true,
      data: "Only POST requests are allowed"
    });
  }

  const objectHash = req.body.objectHash;


  if (!objectHash || typeof objectHash != 'string') {
    return res.status(400).json({
      code: 400,
      isError: true,
      data: "You must provide a path to look for in 'objectHash' body parameter"
    });
  }

  const content = req.body.content;

  if (!content || typeof content != 'string') {
    return res.status(400).json({
      code: 400,
      isError: true,
      data: "You must provide a path to look for in 'content' body parameter"
    });
  }

  if (await tree.readByObjectHash(objectHash) == null) {
    return res.status(400).json({
      code: 400,
      isError: true,
      data: "Object does not exist"
    });
  }

  await tree.writeByObjectHash(objectHash, content);

  // set the HTTP status code and send a JSON response with the message
  return res.status(200).json({
    code: 200,
    isError: false,
    data: null
  });
}
