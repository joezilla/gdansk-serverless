// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { log } from 'next-axiom'
import { ObjectCache } from '../../lib/objectcache';


type ServiceResponse = {
    result: any
}


///
/// regenerate index
/// fullScan - all content
/// types - limit to content types. all supported ones if not specified
/// cids - only generate content of these cid's. implies no fullScan.
function regenerateIndex( { allContent, types, cids } : { allContent: boolean, types: string[], cids: string[]}) {

}


// 
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ServiceResponse>
) {
    const API_KEY = process.env.API_KEY;
    const SECRET = req?.headers?.apisecret ?? "";

    var cache = new ObjectCache();

    try {
        if (SECRET === API_KEY) {
            // Process the POST request
            try {
                cache.clearCache();
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