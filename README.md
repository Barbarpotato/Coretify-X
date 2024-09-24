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