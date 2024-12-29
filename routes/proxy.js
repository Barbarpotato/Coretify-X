import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { index } from '../coretify.config.js';
import bodyParser from 'body-parser';
import { limiter } from './middleware.js';
import { hash } from 'crypto';

const proxy = express.Router();

proxy.use(bodyParser.json());


proxy.route('/requester')
    .get(async (req, res) => {

        const date = new Date();

        const ip_address = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // ip address cannot empty during production
        if (index.nodeEnv !== 'Development' && !ip_address) {
            return limiter(req, res, () => {
                return res.status(403).json({ message: 'Forbidden Access' });
            });
        }

        // Generate HASH IP to masking the information data
        const hashed_ip = await bcrypt.hash(ip_address ? ip_address : '127.0.0.1', 10);

        // the secret key for the jwt token in client-server proxy
        const jwtSecretTuning = index.jwtSecret + ip_address ? ip_address : '127.0.0.1';

        const token = jwt.sign({ log: hashed_ip, created: date.toISOString() }, jwtSecretTuning, { expiresIn: '5m' });

        return res.json({ status: 'ok', token });
    })


proxy.route('/validator')
    .post(async (req, res) => {

        const { token } = req.body;

        if (!token) {
            return limiter(req, res, () => {
                return res.status(401).json({ message: 'Invalid credentials' });
            });
        }

        // Generate HASH IP to compare with the one in the token
        const ip_address = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // ip address cannot empty during production
        if (index.nodeEnv !== 'Development' && !ip_address) {
            return limiter(req, res, () => {
                return res.status(403).json({ message: 'Forbidden Access' });
            });
        }

        // the secret key for the jwt token in client-server proxy
        const jwtSecretTuning = index.jwtSecret + ip_address ? ip_address : '127.0.0.1';

        jwt.verify(token, jwtSecretTuning, async (err, decoded) => {
            if (err) {
                return limiter(req, res, () => {
                    return res.status(403).json({ message: 'Invalid token' });
                });
            }

            // Compare the ip address with the one in the token
            const is_ip_valid = await bcrypt.compare(ip_address ? ip_address : '127.0.0.1', decoded.log);

            if (!is_ip_valid) {
                return limiter(req, res, () => {
                    return res.status(403).json({ message: 'Invalid token' });
                });
            }

            res.json({ message: 'Token is valid', data: decoded });
        });
    })

export default proxy;