# Coretify
Coretify is a centralized login account management system designed to simplify and secure user authentication processes across multiple applications. Built with Bun for high-performance server-side JavaScript execution and Express for routing and middleware management, Coretify ensures efficient handling of API requests. The project leverages JWT (JSON Web Tokens) to implement secure and stateless authentication, making it easy for users to log in and manage their accounts across various services. Coretify aims to be a robust, scalable, and secure solution for centralized user account management.

# Installation & Setup
Coretify is built using Bun, so you need to install it first. Visit the <a href="https://bun.sh/">Bun website</a> for installation instructions. After installation, verify that Bun is installed by running:
```bash
bun --version
bun install
```

Create a .env file in the project’s root directory and define the required environment variables. here is the requirement env variables that you need:
```.env
JWT_SECRET_ADMIN=VALUES
JWT_SECRET=VALUES
ADMIN_USERNAME=VALUES
ADMIN_PASSWORD=VALUES
DATABASE_URL=VALUES
```
In Coretify, the environment variables include two distinct JWT secrets: one for regular users and one for admin users. The JWT_SECRET is used for authenticating and issuing tokens for regular users, allowing them to log in and manage their accounts. On the other hand, the JWT_ADMIN_SECRET is specifically designated for admin-level operations. This secret is required for admins to perform sensitive actions such as registering new applications or users, as well as executing create operations within the Coretify environment. By having separate JWT secrets for regular users and admins, Coretify ensures a secure separation of privileges, preventing unauthorized access to critical administrative functions.

# Mysql Support
Coretify currently supports MySQL as the database system. The database schema is managed using Prisma, which provides a structured and flexible way to interact with the database. You are free to modify and extend the database architecture as needed for your specific use case. The current architecture consists of three main models: User, Application, and UserApplication.
```prisma
model User {
  id         Int      @id @default(autoincrement())
  username   String   @unique
  password   String // Store hashed password
  is_active  Boolean  @default(true) // Active/Inactive status
  created_at DateTime @default(now())
  updated_at DateTime @default(now()) @updatedAt

  applications UserApplication[]
}
```
Additionally, a user can be associated with multiple applications through the UserApplication model.
```prisma
model Application {
  id         Int      @id @default(autoincrement())
  app_id     String   @unique
  app_name   String
  app_type   String
  app_url    String
  created_at DateTime @default(now())
  updated_at DateTime @default(now()) @updatedAt

  user_applications UserApplication[]
}
```
Additionally, a user table can be associated with multiple applications through the UserApplication model.

```prisma
model UserApplication {
  id             Int @id @default(autoincrement())
  user_id        Int
  application_id Int

  user        User        @relation(fields: [user_id], references: [id], onDelete: Cascade)
  application Application @relation(fields: [application_id], references: [id], onDelete: Cascade)
}

```
This model creates a link between users and applications, allowing Coretify to track which users are associated with which applications. Both user_id and application_id are tied to their respective records, and if either a user or application is deleted, the related records in UserApplication are also removed (onDelete: Cascade).

This structure allows for efficient user and application management, with clear relationships between users and the applications they can access. The use of Prisma ensures that the database schema can be easily modified as needed to accommodate future requirements.

# Docker Intallation Setup
You can also install the docker image for this project instead cloning the repo from this link : <a href="https://hub.docker.com/r/darmajr94/coretify" target="_blank">darmajr94/coretify</a>

After installing the image of this coretify project you can setup the docker-compose file and running trough this docker-compose. You can actually modified the environment variable value trough this docker-compose as you needed:
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:5.7
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: coretify
    ports:
      - "3301:3306"
  app:
    image: darmajr94/coretify
    ports:
      - "3000:3000"
    environment:
      ADMIN_USERNAME : admin
      ADMIN_PASSWORD : root
      JWT_SECRET_ADMIN : admin_root
      JWT_SECRET : root
      DATABASE_URL: mysql://root:root@mysql:3306/coretify
    depends_on:
      - mysql
    command: >
      sh -c "
      npx prisma migrate deploy &&
      npm run start"
```

# Coretify Configuration
The configuration for Coretify is managed through a single file that streamlines the bundling process and environment variable management. Below is an overview of the main components of the configuration file:
- serverPort: Specifies the port on which the server will run. By default, it is set to 3000.
- jwtSecretAdmin: This retrieves the admin JWT secret from the environment variables, ensuring that administrative actions are protected with a secure token.
- jwtSecret: This retrieves the regular user JWT secret from the environment variables, allowing for secure user authentication.
- corsOptions: This section configures Cross-Origin Resource Sharing (CORS) settings, which define how your server interacts with requests from different origins. Key components include:
- origin: A function that specifies which origins are allowed to access the server. Currently, it is set to allow all origins (callback(null, true)).
- allowedHeaders: Specifies which headers can be included in requests. This includes Content-Type and Authorization, essential for handling requests with JSON data and token-based authentication.
- maxAge: Defines the duration (in seconds) that the CORS preflight request can be cached. In this configuration, it is set to 120 seconds (or 2 minutes).

This configuration file plays a crucial role in ensuring that Coretify operates securely and efficiently, making it easy to manage settings and sensitive information in one place

# Authentication API

This document outlines the API for user authentication using JWT tokens in the Express application.

## Authentication Route

| Method | Endpoint | Request Body                          | Response Body                             | Description                               |
|--------|----------|---------------------------------------|-------------------------------------------|-------------------------------------------|
| POST   | `/auth`  | `{ "token": "<JWT_TOKEN>" }`         | `{"message": "Token is valid", "user": { ... }}` or `{"message": "Invalid credentials"}` or `{"message": "Invalid token"}` | Validates the provided JWT token. If valid, returns user information; otherwise returns an error message. |

### Request Body

- `token` (string): The JWT token that needs to be validated.

### Response Body

- **Success (200)**:
  - `message`: Confirmation that the token is valid.
  - `user`: Contains user information decoded from the token.

- **Invalid Credentials (401)**:
  - `message`: "Invalid credentials" when no token is provided.

- **Invalid Token (403)**:
  - `message`: "Invalid token" when the provided token cannot be verified.

## Usage Example

To authenticate a user, send a POST request to `/auth` with the JWT token in the request body:

```bash
curl -X POST http://<your-server>/auth -H "Content-Type: application/json" -d '{"token": "<JWT_TOKEN>"}'
```

# Login API

This document outlines the API for user login in the Express application, supporting both admin and client logins.

## Login Routes

### Admin Login

| Method | Endpoint     | Request Body                       | Response Body                                | Description                                              |
|--------|--------------|------------------------------------|----------------------------------------------|----------------------------------------------------------|
| GET    | `/login/admin` | N/A                                | Renders the login page for admin.           | Serves the admin login page (EJS template).            |
| POST   | `/login/admin` | `{ "username": "<ADMIN_USERNAME>", "password": "<ADMIN_PASSWORD>" }` | `{"status": "ok", "token": "<JWT_TOKEN>"}` or `{"message": "Invalid credentials"}` | Validates admin credentials. Returns a JWT token if valid. |

### Client Login

| Method | Endpoint         | Request Body                                                                                             | Response Body                                                                                                | Description                                               |
|--------|------------------|---------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|
| POST   | `/login/client`   | `{ "username": "<USERNAME>", "password": "<PASSWORD>", "app_token": "<APPLICATION_TOKEN>" }`             | `{"status": "ok", "token": "<JWT_TOKEN>", "application_token": "<APPLICATION_ID>"}` or `{"error": "Invalid Parameters"}` | Logs in the client user and returns a JWT and application token. |

## Request Body

### Admin Login
- `username` (string): The username for the admin.
- `password` (string): The password for the admin.

### Client Login
- `username` (string): The username for the client account.
- `password` (string): The password for the client account.
- `app_token` (string): The application token representing the client's access to a specific application.

## Response Body

### Admin Login
- **Success (200)**:
  - `status`: "ok"
  - `token`: The JWT token for the admin session.

- **Invalid Credentials (401)**:
  - `message`: "Invalid credentials" when username or password is incorrect.

### Client Login
- **Success (200)**:
  - `status`: "ok"
  - `token`: The JWT token for the authenticated session.
  - `application_token`: The `app_id` associated with the user's application.

- **User Not Active (401)**:
  - `message`: "User is not active" when the user account is inactive.

- **Invalid Credentials (401)**:
  - `message`: "Invalid credentials" when username or password is incorrect.

## Usage Examples

### Admin Login

To log in as an admin, send a POST request to `/login/admin`:

```bash
curl -X POST http://<your-server>/login/admin -H "Content-Type: application/json" -d '{"username": "<ADMIN_USERNAME>", "password": "<ADMIN_PASSWORD>"}'
```

# Registration API

This document outlines the API for user and application registration in the Express application.

## Registration Routes

### Application Registration

| Method | Endpoint         | Request Body                                          | Response Body                                   | Description                                          |
|--------|------------------|------------------------------------------------------|------------------------------------------------|------------------------------------------------------|
| POST   | `/register/application` | `{ "app_name": "<APPLICATION_NAME>", "app_type": "<APPLICATION_TYPE>", "app_url": "<APPLICATION_URL>" }` | `{"message": "Application registered successfully"}` or `{"error": "All fields are required"}` | Registers a new application with the provided details. |

### User Registration

| Method | Endpoint         | Request Body                                | Response Body                                   | Description                                          |
|--------|------------------|---------------------------------------------|------------------------------------------------|------------------------------------------------------|
| POST   | `/register/user`  | `{ "username": "<USERNAME>", "password": "<PASSWORD>" }` | `{"message": "User registered successfully"}` or `{"error": "Username and password are required"}` or `{"error": "Username already exists"}` | Registers a new user account with the provided username and password. |

## Request Body

### Application Registration
- `app_name` (string): The name of the application.
- `app_type` (string): The type of the application.
- `app_url` (string): The URL of the application.

### User Registration
- `username` (string): The username for the new account.
- `password` (string): The password for the new account.

## Response Body

### Application Registration
- **Success (201)**:
  - `message`: Confirmation that the application was registered successfully.

- **Missing Fields (400)**:
  - `error`: "All fields are required" when any field is missing.

### User Registration
- **Success (201)**:
  - `message`: Confirmation that the user was registered successfully.

- **Missing Fields (400)**:
  - `error`: "Username and password are required" when either field is missing.

- **Username Exists (400)**:
  - `error`: "Username already exists" when trying to register a username that is already taken.

## Usage Examples

### Application Registration

To register a new application, send a POST request to `/register/application`:

```bash
curl -X POST http://<your-server>/register/application -H "Content-Type: application/json" -d '{"app_name": "<APPLICATION_NAME>", "app_type": "<APPLICATION_TYPE>", "app_url": "<APPLICATION_URL>"}'
```