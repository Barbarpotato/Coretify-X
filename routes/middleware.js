import { index } from '../coretify.config.js';
import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    // if no token provided from authorization
    // attempt to get the token data from cookies
    if (!token) {

        const cookies = req.cookies;

        token = cookies['token'];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
    }

    jwt.verify(token, index.jwtSecretAdmin, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = user;
        next();
    });
};