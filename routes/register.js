import { authenticateToken } from '../routes/middleware.js';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';

const register = express.Router();
const prisma = new PrismaClient();

register.use(bodyParser.json());

register.route('/application')
    .post(authenticateToken, async (req, res) => {

        const { app_name, app_type, app_url } = req.body;

        // validate the request body
        if (!app_name || !app_type || !app_url) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        try {
            const newApplication = await prisma.application.create({
                data: {
                    app_id: uuidv4(),
                    app_name,
                    app_type,
                    app_url
                },
            });

            return res.status(201).json({ message: 'Application registered successfully' });

        } catch (error) {
            console.error(error)
            return res.status(500).json({ error: 'Application registration failed' });
        }
    })

register.route('/user')
    .post(authenticateToken, async (req, res) => {
        const { username, password } = req.body;

        // validate the request body
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const newUser = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword, // Store the hashed password
                },
            });

            return res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            // Handle unique constraint error (P2002)
            if (error.code === 'P2002' && error.meta.target === 'User_username_key') {
                return res.status(400).json({ error: 'Username already exists' });
            }
            return res.status(500).json({ error: 'User registration failed' });
        }
    })

export default register;