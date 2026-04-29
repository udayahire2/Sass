const Redis = require('ioredis');

const { env } = require('./env');

class CacheClient {
    constructor() {
        this.memory = new Map();
        this.redis = null;

        if (env.redisUrl) {
            this.redis = new Redis(env.redisUrl, {
                lazyConnect: true,
                maxRetriesPerRequest: 1,
            });

            this.redis.on('error', (error) => {
                console.error('Redis connection error, using in-memory fallback:', error.message);
            });
        }
    }

    async connect() {
        if (!this.redis) {
            return;
        }

        try {
            if (this.redis.status !== 'ready') {
                await this.redis.connect();
            }
        } catch (error) {
            console.error('Redis unavailable, continuing with in-memory cache:', error.message);
            this.redis = null;
        }
    }

    async get(key) {
        if (this.redis) {
            const raw = await this.redis.get(key);
            return raw ? JSON.parse(raw) : null;
        }

        const record = this.memory.get(key);
        if (!record || record.expiresAt < Date.now()) {
            this.memory.delete(key);
            return null;
        }

        return record.value;
    }

    async set(key, value, ttlSeconds = 60) {
        if (this.redis) {
            await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
            return;
        }

        this.memory.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }

    async del(key) {
        if (this.redis) {
            await this.redis.del(key);
            return;
        }

        this.memory.delete(key);
    }

    async delByPrefix(prefix) {
        if (this.redis) {
            const keys = await this.redis.keys(`${prefix}*`);
            if (keys.length) {
                await this.redis.del(keys);
            }
            return;
        }

        for (const key of this.memory.keys()) {
            if (key.startsWith(prefix)) {
                this.memory.delete(key);
            }
        }
    }

    async wrap(key, ttlSeconds, compute) {
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }

        const value = await compute();
        await this.set(key, value, ttlSeconds);
        return value;
    }
}

const cache = new CacheClient();

module.exports = { cache };
