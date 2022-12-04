// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { ObjectCache } from "../lib/objectcache"
import { IStreet, IPost } from "../src/@types/contentful";
import { Entry, Sys, Link, LinkType } from "contentful";
import { isEmptyString } from "../lib/util";

// logging
import { log } from 'next-axiom'
// object cache
const cache = new ObjectCache();

// util

// //// algolia
import algoliasearch from 'algoliasearch';
const searchClient = algoliasearch(
    process.env.ALGOLIA_APP_ID ?? "",
    process.env.ALGOLIA_ACCESS_TOKEN ?? "");
const algoliaIndex = searchClient.initIndex(process.env.ALGOLIA_INDEX_NAME ?? "");

// //// contentful client
import { createClient } from "contentful";
const contentfulClient = createClient({
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    space: process.env.CONTENTFUL_SPACE_ID
});

/**
 *  
 */
export class FeederObject {
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
export interface DependencyManager {
    addDependency: (contentId: string) => void;
}

// yeah, but..export
class DefaultDependencyManager implements DependencyManager {
    addDependency(contentId: string) {
        throw new Error("dependeny tracking not yet implemented");
    }
}

// feeder interface
export interface Feeder<T> {
    // index the object in the index
    index: (object: T, DependencyManager: DependencyManager) => void;

    // delete the object in the index
    delete: (id: string) => void;
}

// baseline feeder
export abstract class AbstractFeeder<T> implements Feeder<T> {

    abstract index(object: T, DependencyManager: DependencyManager): void;

    async delete(id: string) {
        log.debug("deleting entry", id);
        await algoliaIndex.deleteObject(id);
    }

    async doIndex(toIndex: AbstractIndexObject) {
        if (!toIndex.validate()) {
            log.error("Validation failed for", toIndex);
            throw new Error("invalid object");
        }
        log.debug("indexing", toIndex);
        await algoliaIndex.saveObject(toIndex);
    }
}

// common index structure
export class AbstractIndexObject {
    objectID: string;
    type: string;
    tags: string[] | undefined;
    locale: string = "en-US";

    // index object for streets
    constructor({ objectID, type, tags, locale }: { objectID: string, type: string, tags: string[], locale: string }) {
        this.objectID = objectID;
        this.type = type;
        this.tags = tags;
        this.locale = locale;
    }

    setLocale(locale: string) {
        this.locale = locale;
    }

    addTag(tag: string) {
        this.tags?.push(tag);
    }

    validate(): boolean {
        if (isEmptyString(this.objectID) || isEmptyString(this.type)) {
            log.error("missing objectID or type");
            return false;
        }
        return true;
    }
}

// to be the controller
export class IndexingController {
    private feederList = new Map<string, Feeder<any>>();

    public addFeeder<T>(type: string, feeder: Feeder<T>) {
        this.feederList.set(type, feeder);
    }

    getFeeder(objectType: string) {
        return this.feederList.get(objectType);
    }

    public async delete(data: FeederObject) {
        let feeder = this.getFeeder(data.objectType);
        if (!feeder) {
            log.error(`Cannot find feeder for type #{data.objectType}`);
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

        } else if ("Entry" === data.contentType) {

            let feeder = this.getFeeder(data.objectType);
            if (!feeder) {
                throw new Error("no feeder found");
            }
            // get entry
            const entry = await cache.getCachedEntry(data.id, () => {
                log.debug(`Querying contentful entry with id ${data.id}`);
                return contentfulClient.getEntry<IStreet>(data.id);
            }) as Entry<IStreet>;


            log.debug("Contentful returned", entry)

            // feed it
            feeder.index(entry, dependencyManager);

        } else {
            log.debug(`ignoring object of type ${data.contentType} due to missing handler`);
        }
    }

    public async indexAll(type: string) {
        let dependencyManager = new DefaultDependencyManager();
        let offset = 0;
        let batch = 0;
        // find the right feeder for this type
        let feeder = this.getFeeder(type);
        if (!feeder) {
            throw new Error("no feeder found");
        }
        // go in batches of 100, until nothing else is returned.
        do {
            batch = 0;
            await contentfulClient.getEntries({ locale: "en-US", content_type: type, skip: offset, limit: 100}).then((response) =>
                response.items.map(item => {
                    console.debug(`Reindexing ${item.sys.contentType.sys.id}-${item.sys.id}`);
                    // index
                    try {                                               
                         // feed it
                         feeder?.index(item, dependencyManager);                    
                    } catch (e) {
                        log.error(`Failed to index ${item.sys.id}`, e);
                    }
                    offset++;
                    batch++;
                }
                ));
            /// console.log("current batch size was: ", batch);
        } while (batch > 0);
        console.info(`Reindexed ${offset} items`);
    }

}
