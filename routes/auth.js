import express from 'express';
import jwt from 'jsonwebtoken';
import { limiter } from './middleware.js';
import { index } from '../coretify.config.js';
import bodyParser from 'body-parser';

const auth = express.Router();

auth.use(bodyParser.json());

auth.route('')
    .post(limiter, (req, res) => {

        const { token } = req.body;

        if (!token) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify the JWT token without using middleware
        jwt.verify(token, index.jwtSecret, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }

            // Token is valid, you can use the user information
            res.json({ message: 'Token is valid', user });
        });

    })

export default auth;
