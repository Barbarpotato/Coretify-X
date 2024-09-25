import { authenticateToken } from '../routes/middleware.js';
import { PrismaClient } from '@prisma/client';
import express from 'express';
import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';

const register = express.Router();
const prisma = new PrismaClient();

register.use(bodyParser.json());

register.route('')
    .get((req, res) => {
        return res.status(200).json({
            message: 'Welcome to Register Site!',
            info: "There are 2 types of registration in this endpoint: \n 1. User Register \n 2. Application Register",
            endpoint: ["user", "application"]
        });
    })

register.route('/application')
    .post(authenticateToken, (req, res) => {
        res.status(201).json({ message: 'Success' });
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

            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            // Handle unique constraint error (P2002)
            if (error.code === 'P2002' && error.meta.target === 'User_username_key') {
                return res.status(400).json({ error: 'Username already exists' });
            }
            return res.status(500).json({ error: 'User registration failed' });
        }
    })

export default register;