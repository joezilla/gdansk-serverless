// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import "../../listener-config.js"
import {ObjectCache} from "../../lib/objectcache"
import {IStreet} from "../../src/@types/contentful";
import { Entry, Sys, Link, LinkType } from "contentful";


import { Logger } from "tslog";
const log: Logger = new Logger();
const cache = new ObjectCache();

// //// algolia
// todo make this configurable
// import { SearchClient } from 'algoliasearch';
import algoliasearch from 'algoliasearch';
const searchClient = algoliasearch(
  process.env.ALGOLIA_APP_ID ?? "",
  process.env.ALGOLIA_ACCESS_TOKEN ?? "");
const algoliaIndex = searchClient.initIndex(process.env.ALGOLIA_INDEX_NAME ?? "");

// //// contentful client
import { Asset, createClient, EntryCollection } from "contentful";
const contentfulClient = createClient({
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  space: process.env.CONTENTFUL_SPACE_ID
});

// input expected from the web service; compatible with the contentful webhook for algolia.
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

// tracks dependencies to other objects during indexing for later invalidation
interface DependencyManager {
  addDependency: (contentId: string) => void;
}

// yeah, but..
class DefaultDependencyManager implements DependencyManager {
  addDependency(contentId: string) {
    throw new Error("dependeny tracking not yet implemented");
  }
}

interface Feeder<T> {
  // index the object in the index
  index: (object: T, DependencyManager: DependencyManager) => void;

  // delete the object in the index
  delete: (id: string) => void;

}

class AlgoliaObject {
  constructor(public objectID: string) {
    this.objectID = objectID;
  }
  [key: string]: any;
}

class StreetFeeder implements Feeder<IStreet> {
  index(sourceObject: IStreet, DependencyManager: DependencyManager) {

    log.debug("indexing entry", sourceObject.sys.id);

    var toIndex = new AlgoliaObject(sourceObject.sys.id);

    if(!sourceObject.fields.germanName) {
      log.error("no german name for street. notindexing ", sourceObject.sys.id);
      return;
    }

    toIndex["firstLetter"] = sourceObject.fields.germanName[0];
    toIndex["germanName"] = sourceObject.fields.germanName;
    toIndex["polishNames"] = sourceObject.fields.polishNames;
    toIndex["district"] = sourceObject.fields.district;
    toIndex["history"] = sourceObject.fields.history;
    toIndex["city"] = sourceObject.fields.city?.fields.name;
    toIndex["source"] = sourceObject.fields.source;
    toIndex["images"] = sourceObject.fields.images;

    log.debug("Indexing object", toIndex);
    
    algoliaIndex.saveObject(toIndex);
  }
  
  delete(id: string) {
    log.debug("deleting entry", id);
    algoliaIndex.deleteObject(id);
  }
}

// to be the controller
class IndexingController { 

  private feederList = new Map<string, Feeder<any>>();

  constructor() {
    this.feederList.set("street", new StreetFeeder());
  }

  getFeeder(objectType: string) {
    return this.feederList.get(objectType);
  }

  public async delete(data:FeederObject) {
    let feeder = this.getFeeder(data.objectType);
    if(!feeder) {
      throw new Error("no feeder found");
    }
    feeder.delete(data.id);
  }

  public async index(data: FeederObject) {
    let dependencyManager = new DefaultDependencyManager();

    if ("Asset" === data.contentType) {

      throw new Error("todo");
      /*&
      const entry = await cache.getCachedEntry(data.id, () => { 
        log.debug(`Querying contentful asset with id ${data.id}`);
        return contentfulClient.getAsset(data.id);
      }, 0) as Asset;
      log.debug("Retrieved entry", entry)
      */

    } else if("Entry" === data.contentType) {

      let feeder = this.getFeeder(data.objectType);
      if(!feeder) {
        throw new Error("no feeder found");
      }
      // get entry
      const entry = await cache.getCachedEntry(data.id, () => { 
        log.debug(`Querying contentful entry with id ${data.id}`);
        return contentfulClient.getEntry<IStreet>(data.id);
      }) as Entry<IStreet>;
      
      // feed it
      feeder.index(entry, dependencyManager);

    }

  }
}


type ServiceResponse = {
  result: any
}

// 
export  default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServiceResponse>
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
        let n = new IndexingController();

        if(req.method === "POST" || req.method === "PUT") {
          n.index(toIndex);
        } else if (req.method === "DELETE") {
          n.delete(toIndex);
        }
        res.status(200).json({ result: "ok" })
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

