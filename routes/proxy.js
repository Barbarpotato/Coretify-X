import express from 'express';
import jwt from 'jsonwebtoken';
import { index } from '../coretify.config.js';
import bodyParser from 'body-parser';
import { limiter } from './middleware.js';

const proxy = express.Router();

proxy.use(bodyParser.json());

proxy.route('/requester')
    .get(limiter, async (req, res) => {

        const Secretkey = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const jwtSecret = Secretkey ? Secretkey : "localhost";

        console.log(jwtSecret);

        const token = jwt.sign({ ...req.headers }, jwtSecret, { expiresIn: '5m' });

        return res.json({ status: 'ok', token });
    })

proxy.route('/validator')
    .post((req, res) => {

        const { token, key } = req.body;

        if (!token || !key) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        jwt.verify(token, key, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }
            res.json({ message: 'Token is valid', user: decoded });
        });
    })

export default proxy;