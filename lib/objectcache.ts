/*
 * Cache storage layer (backed by Reddis / Upstash.com)
 */
import { Redis } from '@upstash/redis'

import { Logger } from "tslog";
const log: Logger = new Logger();

type AssetCacheEntry = {
    id: string,
    timestamp: number,
    value: string
}

const redisClient = Redis.fromEnv(); 

/**
 * Generic object cache backed by a simple redis db.
 */
export class ObjectCache {
    /**
     * Cached lookup of objects
     * 
     * @param id identifier, string
     * @param fn function to call to get the value
     * @param timeout timeout in seconds
     * @returns cached or retrieved value
     */
    async getCachedEntry<Any>(id: string, fn: (id: string) => any, timeout: number = 0) {
        if(!id) {
            throw new Error("id is required");
        }
        //  
        // retrieve the object from redis
        const key = `asset:${id}`;
        const entry = await redisClient.get(key) as AssetCacheEntry;
        if(entry) {
            log.debug(`cache hit for ${key}`);
            if(timeout > 0 && entry.timestamp + timeout * 1000 < Date.now()) {
                // cache expired
                var value = await fn(id);
                await redisClient.set(key, JSON.stringify({id, timestamp: Date.now(), value}));
                return value;
            } else {
                return entry.value;
            }
        } else {
            log.debug(`cache miss for ${key}`);
            var value = await fn(id);
            value = JSON.stringify(value);
            await redisClient.set(key, JSON.stringify({id, timestamp: Date.now(), value}));
            return value;
        }
    }
}