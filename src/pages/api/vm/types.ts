import MongoData from "@/core/MongoData";
import _ from "lodash";
import fs from "node:fs";
import type { NextApiRequest, NextApiResponse } from "next";

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
  res: NextApiResponse<String> // the response object
) {
    let source = []
    const dependencies = (await MongoData.indexObjects()).filter((object) => !_.isEmpty(object?.id)).map((object) => {
        return `"${object.id}"`
    })

    source.push(fs.readFileSync(process.cwd() + "/public/types.ts", "utf-8"))
 
  return res.status(200).end(source.join("\n").replaceAll("$dependencies$", dependencies.join(" | ")));
}
