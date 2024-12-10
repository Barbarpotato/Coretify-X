import express from 'express';
import jwt from 'jsonwebtoken';
import { limiter } from './middleware.js';
import { index } from '../coretify.config.js';
import bodyParser from 'body-parser';

const auth = express.Router();

auth.use(bodyParser.json());

auth.route('')
    .post((req, res, next) => {
        const { token } = req.body;

        if (!token) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify the JWT token without using middleware
        jwt.verify(token, index.jwtSecret, (err, user) => {
            if (err) {
                // Apply limiter only when token verification fails
                return limiter(req, res, () => {
                    return res.status(403).json({ message: 'Invalid token' });
                });
            }

            // Token is valid, continue with the request
            // Proceed to the next middleware or route handler
            req.user = user; // Add user info to the request
            next();
        });
    }, (req, res) => {
        // This block will only run if the token is valid
        res.json({ message: 'Token is valid', user: req.user });
    });

export default auth;
