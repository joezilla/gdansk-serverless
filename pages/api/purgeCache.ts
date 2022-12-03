// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { log } from 'next-axiom'
import { ObjectCache } from '../../lib/objectcache';


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