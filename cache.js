import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import RedisClient from "ioredis";
import dotenv from 'dotenv';
import { index } from "./coretify.config.js";
dotenv.config();

// Configure Redis client
const redisClient = new RedisClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});

// Configure rate limiter
const limiter = index.useRateLimit ? rateLimit({
    windowMs: 3 * 60 * 1000,  // 3 minutes
    max: 15,  // limit each IP to 15 requests per 3 minutes
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