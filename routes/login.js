import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { index } from '../coretify.config.js';
import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';

const login = express.Router();
const prisma = new PrismaClient();

login.use(bodyParser.json());

login.route('')
    .get((req, res) => {
        return res.status(200).json({
            message: 'Welcome to Login Site!',
            info: "There are 2 types of login in this endpoint: \n 1. Admin Login \n 2. Client Login",
            endpoint_list: ["admin", "client"]
        });
    })

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
            secure: false,    // Cookie only sent over HTTPS (use in production)
            maxAge: 60 * 60 * 1000 // 1 hour expiry
        });

        return res.json({ token });
    })

login.route('/client')
    .post(async (req, res) => {

        const { username, password } = req.body;

        // validate the request body
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        try {
            // Find the user in the database
            const currentUser = await prisma.user.findUnique({
                where: { username },
            });

            // Check if user exists
            if (!currentUser) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Compare the hashed password
            const isPasswordValid = await bcrypt.compare(password, currentUser.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate a JWT token
            const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.json({ token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }

    })

export default login;
