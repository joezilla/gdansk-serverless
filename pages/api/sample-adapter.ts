
import "../../lib/objectcache"
import { Asset, Entry, Sys, Link, ContentType } from "contentful";

import { Logger } from "tslog";

import {IStreet} from "../../src/@types/contentful";

const log: Logger = new Logger();

interface ContentRepository<U, T extends Entry<U>> {
    getEntry(id: string): Entry<T>;
    getAsset(id: string): Asset;
}


// use Link, not Sys
class Dependencies {
    entries: Link<ContentType>[] = [];
    addEntry(entry: Link) {
        if(!entry.id) {
            throw new Error("Entry must have an id");
        }
        if(!entry.contentType) {
            throw new Error("Entry must have a linkType");
        }
        this.entries.push(entry);
    }
    getEntries(): Sys[] {
        return this.entries;
    }
}

interface Indexer<U, T extends Entry<U>> {

    new(repository: ContentRepository<U,T>) : Indexer<U,T>;
    
    // 
    mapDependencies: (theEntry: T, deps: Dependencies) => void;

    // process an entry, index it
    indexEntry: (theEntry: T) => void;

    // proces an asset
    indexAsset: (asset: Asset) => void;

}

class StreetIndexer implements Indexer<IStreet, Entry<IStreet>> {

    mapDependencies(theEntry: Entry<IStreet>): void {
        log.info("mapDependencies");
    }

    indexEntry(theEntry: Entry<IStreet>): void {
        log.info("indexEntry");
    }

    indexAsset(asset: Asset): void {
        log.info("indexAsset");
    }



}
