import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { index } from '../coretify.config.js';
import bodyParser from 'body-parser';

const admin = express.Router();

admin.use(bodyParser.json());

admin.route('')
    .get((req, res) => {

        // Get cookies from the request
        const cookies = req.cookies;

        // Example: getting a specific cookie
        const token = cookies['token'];
        // Verify the JWT token
        jwt.verify(token, index.jwtSecretAdmin, (err, user) => {

            // ** if jwt is invalid force redirect to login adin
            if (err) {
                return res.redirect('/login/admin');
            }
            // ** if jwt is valid render the admin main page
            return res.render("admin.ejs", { title: "Coretify - Admin" });
        });
    })

admin.route('/auth')
    .post((req, res) => {

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


export default admin;
