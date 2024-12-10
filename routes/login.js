import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { index } from '../coretify.config.js';
import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';
import { limiter } from './middleware.js';

const login = express.Router();
const prisma = new PrismaClient();

// Middleware to parse JSON bodies
login.use(bodyParser.json());

// Route: Admin Login
login.route('/admin')
    .get((_req, res) => {
        res.render("partials/login.ejs", { title: "Coretify - Login Admin" });
    })
    .post(limiter, (req, res) => {
        const { username, password } = req.body;

        // Validate admin credentials using environment variables
        if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ username }, index.jwtSecretAdmin, { expiresIn: '1h' });

        // Set the token as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Use HTTPS in production
            maxAge: 60 * 60 * 1000 // 1 hour expiry
        });

        return res.json({ status: 'ok', token });
    });

// Route: Client Login
login.route('/client')
    .post(limiter, async (req, res) => {
        const { username, password, app_token } = req.body;

        // Validate the request body
        if (!username || !password || !app_token) {
            return res.status(400).json({ error: 'Invalid Parameters' });
        }

        try {
            // Query the user application data
            const userApplication = await prisma.userApplication.findMany({
                where: {
                    user: {
                        username,
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
                            app_id: true
                        }
                    }
                }
            });

            // Validate if user application data exists
            if (userApplication.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Extract relevant data
            const { username: usernameQuery, password: hashedPassword } = userApplication[0].user;
            const { app_id: applicationIdQuery } = userApplication[0].application;

            // Compare the hashed password
            const isPasswordValid = await bcrypt.compare(password, hashedPassword);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate a JWT token
            const token = jwt.sign({ username: usernameQuery }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Respond with the token and application token
            return res.json({ status: 'ok', token, application_token: applicationIdQuery });
        } catch (error) {
            console.error('Error during client login:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    });

export default login;
