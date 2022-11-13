// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import "../../listener-config.js"
import {ObjectCache} from "../../lib/objectcache"
import {IStreet} from "../../src/@types/contentful";
import { Entry, Sys, Link, LinkType } from "contentful";

import { Logger } from "tslog";
const log: Logger = new Logger();
const cache = new ObjectCache();

type Nullable<T> = T | null;
type Data = {
  result: any
}
const LOCALE = "en-US";

import { Asset, createClient, EntryCollection } from "contentful";
const contentfulClient = createClient({
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  space: process.env.CONTENTFUL_SPACE_ID
});

function extractContent<Any>(data: any, config: any) {
  let id  = "1beB3xJtefTJdvcgHguMyj";

  let entry = cache.getCachedEntry(id, () => { 
    return contentfulClient.getAsset(id);
  }, 5);
  
  log.debug("Retrieved entry", entry)  
}

async function getAsset<Asset>(data: any) {
  let cache = new ObjectCache();
  let id  = "1beB3xJtefTJdvcgHguMyj";
  const entry = await cache.getCachedEntry(id, () => { 
    log.debug(`Querying contentful asset with id ${id}`);
    return contentfulClient.getAsset(id);
  }, 0) as Asset;
  return entry;
}


class FeederObject  {
  constructor(public id: string, public contentType: "Asset" | "Entry", public objectType: string) {
    this.id = id;
    this.objectType = objectType;
    this.contentType = contentType;
  }
  toString(): string {
    return `${this.contentType}(id=${this.id}, type=${this.objectType})`;
  }
}

interface DependencyManager {
  addDependency: (contentId: string) => void;
}
class DefaultDependencyManager implements DependencyManager {
  addDependency(contentId: string) {

  }
}

interface Feeder<T> {
  // index the object in the index
  index: (object: Entry<T>, DependencyManager: DependencyManager) => void;

  // index the object in the index
 // indexAsset: (object: Asset, DependencyManager: DependencyManager) => void;

  // update the object in the index
  update: (object: Entry<T>, DependencyManager: DependencyManager) => void;

  /// update asset`
 // udpateAsset: (object: Entry<T>, DependencyManager: DependencyManager) => void;

  // delete the object in the index
  delete: (id: string) => void;

  // delete asset from the index
 // deleteAsset: (id: string) => void;
}

class StreetFeeder implements Feeder<IStreet> {
  index(object: Entry<IStreet>, DependencyManager: DependencyManager) {
    log.debug("indexing entry", object);
  }
  update (object: Entry<IStreet>, DependencyManager: DependencyManager) {
    log.debug("updating entry", object);
  }
  delete(id: string) {
    log.debug("deleting entry", id);

  }
}

class NameMeLater { 

  private feederList = new Map<string, Feeder<any>>();

  constructor() {
    this.feederList.set("street", new StreetFeeder());
  }

  getFeeder(objectType: string) {
    return this.feederList.get(objectType);
  }

  public async index(data: FeederObject) {
    let dependencyManager = new DefaultDependencyManager();

    if ("Asset" === data.contentType) {
      const entry = await cache.getCachedEntry(data.id, () => { 
        log.debug(`Querying contentful asset with id ${data.id}`);
        return contentfulClient.getAsset(data.id);
      }, 0) as Asset;
      log.debug("Retrieved entry", entry)

    } else if("Entry" === data.contentType) {

      let feeder = this.getFeeder(data.objectType);
      if(!feeder) {
        throw new Error("no feeder found");
      }
      // get entry
      const entry = await cache.getCachedEntry(data.id, () => { 
        log.debug(`Querying contentful entry with id ${data.id}`);
        return contentfulClient.getEntry(data.id);
      }, 0) as Entry<IStreet>;
      log.debug("Retrieved entry", entry);
      // feed it
      feeder.index(entry, dependencyManager);

    }

  }
}


export  default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const API_KEY = process.env.API_KEY;
  const SECRET  = req?.headers?.apisecret ?? "";
  try {
    if (SECRET === API_KEY) {
      // Process the POST request
      try {

        // todo: make this a little more failsafe
        const fromHook = req.body as any;
        const toIndex = new FeederObject(fromHook.sys.id, fromHook.sys.type, fromHook.sys.contentType.sys.id);
      
        let n = new NameMeLater();
        n.index(toIndex);
/*
        console.log(`Indexing ${toIndex}`);

        if ("Asset" === toIndex.contentType) {
          const entry = await cache.getCachedEntry(toIndex.id, () => { 
            log.debug(`Querying contentful asset with id ${toIndex.id}`);
            return contentfulClient.getAsset(toIndex.id);
          }, 0) as Asset;
          log.debug("Retrieved entry", entry)

        } else if("Entry" === toIndex.contentType) {
      
          const entry = await cache.getCachedEntry(toIndex.id, () => { 
            log.debug(`Querying contentful entry with id ${toIndex.id}`);
            return contentfulClient.getEntry(toIndex.id);
          }, 0) as Entry<IStreet>
          log.debug("Retrieved entry", entry);
      }
*/

        //const theAsset = await getAsset(req.body) as Asset;
        // console.log(theAsset);
        // res.status(200).json({ result: theAsset })
      } catch (e) {
        console.log(e);
        res.status(500).json({ result: `error: ${e}`});
      }
    } else {
      res.status(401).json({result: "unauthenticated." });
    }
  } catch(err) {
    res.status(500).json({ result: `error: ${err}`});
  }
}

