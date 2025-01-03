// ** CORETIFY CONFIGURATION **
// This file is used to configure the coretify bundling process.
// For more information, please refer to the README.md:
// https://github.com/Barbarpotato/Coretify/blob/main/README.md

// ** ENVIRONMENT VARIABLES  **
// This file is used to configure the environment variables for the coretify bundling process.
import dotenv from 'dotenv';
dotenv.config();

// ** MAIN CONFIGURATION **
// This file is used to configure the main configuration for the coretify bundling process.
export const index = {
    serverPort: 3000,
    jwtSecretAdmin: process.env.JWT_SECRET_ADMIN,
    jwtSecret: process.env.JWT_SECRET,
    corsOptions: {
        origin: ["https://barbarpotato.github.io",
            "https://personal-blog-darmajr.web.app"],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Forwarded-For'],
        maxAge: 120, // 120 seconds = 2 minutes
    },
    useRateLimit: true,
    nodeEnv: process.env.NODE_ENV ? process.env.NODE_ENV : "Development",
};
