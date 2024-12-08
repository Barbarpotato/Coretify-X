import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import RedisClient from "ioredis";
import dotenv from 'dotenv';
import { index } from "./coretify.config";
dotenv.config();

// Configure Redis client
const redisClient = new RedisClient({
    host: process.env.REDIS_HOST, // e.g., "redis-12345.c123.us-east-1-3.ec2.cloud.redislabs.com"
    port: process.env.REDIS_PORT, // Redis Cloud instance port
    password: process.env.REDIS_PASSWORD,
});


// Configure rate limiter
const limiter = index.useRateLimit ? rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 minutes
    max: 10,  // limit each IP to 10 requests per windowMs
    keyGenerator: (req) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        return ip;
    },
    store: new RedisStore({
        sendCommand: (...args) => {
            return redisClient.call(...args);
        },
    }),
    handler: (req, res) => {
        res.status(429).send('Too many requests, please try again later.');
    },
}) : (req, res, next) => next();

export default limiter;