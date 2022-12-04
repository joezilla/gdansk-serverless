//
// Re-index entire list of acontent type
// 
// endpoint to re-index. /api/reindex/<content-type-name>
//

import type { NextApiRequest, NextApiResponse } from 'next'
import { log } from 'next-axiom'
import { ObjectCache } from '../../../lib/objectcache';
import { IndexingController } from '../../../lib/indexer';
import { isEmptyString } from "../../../lib/util";
import { StreetFeeder, PostFeeder } from "../../../lib/customfeeders";

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

              const {
                    query: { type }, 
                    method,
                } = req;

                // can be array or single string
                const ft = Array.isArray(type) ?type[0] : type;
                            
                if(isEmptyString(ft)) {
                    throw new Error("No content type given.");
                }
                
                let ic = new IndexingController();
                // register the two feeders available
                ic.addFeeder("street", new StreetFeeder());
                ic.addFeeder("post", new PostFeeder());

                log.info(`Re-Indexing all of type >${type}<`);

                ic.indexAll(ft as string);
                
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