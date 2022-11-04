// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import "../../listener-config.js"

type Nullable<T> = T | null;
type Data = {
  result: string
}
const LOCALE = "en-US";


function extractContent(data: any, config: any) {
  
}

function doIt(data: any) {
  console.log(data);
  console.log(`===> ${data.fields.germanName[LOCALE]}`);
  console.log(`type ===> ${data.sys.contentType.sys.id}`);
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const API_KEY = process.env.API_KEY;
  const SECRET  = req?.headers?.apisecret ?? "";
  try {
    if (SECRET === API_KEY) {
      // Process the POST request
      doIt(req.body);
      res.status(200).json({ result: "ok" })
    } else {
      res.status(401).json({result: "unauthenticated." });
    }
  } catch(err) {
    res.status(500).json({ result: `error: ${err}`});
  }
}

