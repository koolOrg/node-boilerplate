/* eslint-disable import/prefer-default-export */
import Redis from 'ioredis';
import { redis as redisOps } from '../config/config';
import logger from '../config/logger';
export const redis = new Redis(redisOps);
redis.on('error', (err) => {
    logger(`[REDIS] - error: ${err.stack()}`)
})
.on('connecting', () => {
    logger(`[REDIS] - connecting`)
})
.on('reconnecting', () => {
    logger(`[REDIS] - reconnecting`)
})
export const connectRedis = async () => redis.connect();