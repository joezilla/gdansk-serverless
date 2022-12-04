/**
* single feed endoint, triggered by webhook from contentful.
* accepts DELETE, POST, UPDATE operations
*
* expects body for POST and UPDATE of the following format:
*
* {
*  "sys": {
*   "type": "Entry|Asset",
*    "id": "k4bhCnJD1eqMBwQ76jJVt",
*    "contentType": {
*      "sys": {
*        "id": "street"
*      }
*    }
*   }
* }
**/
import type { NextApiRequest, NextApiResponse } from 'next'
import { IStreet, IPost } from "../../src/@types/contentful";
import { AbstractIndexObject, IndexingController, AbstractFeeder,DependencyManager, FeederObject } from "../../lib/indexer";
import { StreetFeeder, PostFeeder } from "../../lib/customfeeders";
import { isEmptyString } from "../../lib/util";
import { log } from 'next-axiom'


type ServiceResponse = {
  result: any
}

// 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServiceResponse>
) {
  const API_KEY = process.env.API_KEY;
  const SECRET = req?.headers?.apisecret ?? "";
  try {
    if (SECRET === API_KEY) {
      // Process the POST request
      try {

        // todo: make this a little more failsafe
        const fromHook = req.body as any;

        log.debug("Received request", fromHook);

        const toIndex = new FeederObject(fromHook.sys.id, fromHook.sys.type, fromHook.sys.contentType.sys.id);
        let n = new IndexingController();
        // register the two feeders available
        n.addFeeder("street", new StreetFeeder());
        n.addFeeder("post", new PostFeeder());

        if (req.method === "POST" || req.method === "PUT") {
          await n.index(toIndex);
        } else if (req.method === "DELETE") {
          await n.delete(toIndex);
        }
        res.status(200).json({ result: "ok" })
      } catch (e) {
        console.log(e);
        res.status(500).json({ result: `error: ${e}` });
      }
    } else {
      res.status(401).json({ result: "unauthenticated." });
    }
  } catch (err) {
    log.error("Error in handler", err);
    res.status(500).json({ result: `error: ${err}` });
  }
}

