import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { index } from '../coretify.config.js';
import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';

const login = express.Router();
const prisma = new PrismaClient();

login.use(bodyParser.json());

login.route('/admin')
    .get((_req, res) => {
        res.render("partials/login.ejs", { title: "Coretify - Login Admin" });
    })
    .post((req, res) => {

        const { username, password } = req.body;

        // the admin account is directly checked trough env variables
        if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ username }, index.jwtSecretAdmin, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,  // Helps prevent client-side script access
            secure: true,    // Cookie only sent over HTTPS (use in production)
            maxAge: 60 * 60 * 1000 // 1 hour expiry
        });

        return res.json({ status: 'ok', token: token });
    })

login.route('/client')
    .post(async (req, res) => {

        const { username, password, app_token } = req.body;

        // validate the request body
        if (!username || !password || !app_token) {
            return res.status(400).json({ error: 'Invalid Parameters' });
        }

        try {

            // Find the application access for the user and only get app_id
            const user_application = await prisma.userApplication.findMany({
                where: {
                    user: {
                        username: username,
                        is_active: true
                    },
                    application: {
                        app_id: app_token
                    }
                },
                select: {
                    user: {
                        select: {
                            username: true,
                            password: true
                        }
                    },
                    application: {
                        select: {
                            app_id: true  // Only selecting app_id
                        }
                    }
                }
            });

            // check if user_application data exist
            if (user_application.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Extract the data from sql query
            const username_query = user_application[0].user.username;
            const password_query = user_application[0].user.password;
            const application_id_query = user_application[0].application.app_id;

            // Compare the hashed password
            const isPasswordValid = await bcrypt.compare(password, password_query);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate a JWT token
            const token = jwt.sign({ username_query }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.json({ status: 'ok', token: token, application_token: application_id_query });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }

    })

export default login;
