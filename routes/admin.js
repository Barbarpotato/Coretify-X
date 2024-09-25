import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from './middleware.js';
import { PrismaClient } from '@prisma/client';
import { index } from '../coretify.config.js';
import bodyParser from 'body-parser';

const admin = express.Router();
const prisma = new PrismaClient();

admin.use(bodyParser.json());

// ------------------------------------
// ** ADMIN INTERFACE **
// ------------------------------------
admin.route('')
    .get((req, res) => {

        // Get cookies from the request
        const cookies = req.cookies;

        // Example  : getting a specific cookie
        const token = cookies['token'];
        // Verify the JWT token
        jwt.verify(token, index.jwtSecretAdmin, async (err, user) => {

            // ** if jwt is invalid force redirect to login adin
            if (err) {
                return res.redirect('/login/admin');
            }

            // get  all the users data information
            // Find the user in the database
            const user_list = await prisma.user.findMany({
                select: {
                    username: true,
                    is_active: true,
                    created_at: true,
                    updated_at: true
                }
            });

            // ** if jwt is valid render the admin main page
            return res.render("admin/users/overview.ejs", {
                title: "Coretify - Admin",
                user_list: user_list
            });
        });
    })


admin.route('/applications_overview')
    .get((req, res) => {

        // Get cookies from the request
        const cookies = req.cookies;

        // Example  : getting a specific cookie
        const token = cookies['token'];
        // Verify the JWT token
        jwt.verify(token, index.jwtSecretAdmin, (err, user) => {

            // ** if jwt is invalid force redirect to login adin
            if (err) {
                return res.redirect('/login/admin');
            }
            // ** if jwt is valid render the admin main page
            return res.render("admin/applications/overview.ejs", { title: "Coretify - Admin" });
        });
    })

admin.route('/set_inactive')
    .post(authenticateToken, async (req, res) => {

        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        try {
            const user = await prisma.user.update({
                where: { username },
                data: { is_active: false }
            });
            res.status(200).json({ message: 'User deactivated successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'User deactivation failed' });
        }
    })

admin.route('/set_active')
    .post(authenticateToken, async (req, res) => {

        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        try {
            const user = await prisma.user.update({
                where: { username },
                data: { is_active: true }
            });
            res.status(200).json({ message: 'User activated successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'User deactivation failed' });
        }
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
