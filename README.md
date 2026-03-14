# CollectorOS API

Backend API for CollectorOS, a personal collection management platform designed to track inventory, monitor prices, manage wishlist items, and analyze the financial value of collectible hobbies.

## Current Status

This project is currently in active development.

### Completed modules
- Project setup
- Express server
- PostgreSQL with Docker
- Prisma ORM integration
- Health check endpoint
- Auth module
- Standardized API responses and error handling

## Tech Stack

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- Docker
- JWT Authentication
- Zod
- bcrypt

## Project Structure

```txt
src/
├── app/
│   ├── app.js
│   └── server.js
├── common/
│   ├── errors/
│   └── utils/
├── config/
│   ├── env.js
│   └── prisma.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── not-found.middleware.js
├── modules/
│   ├── auth/
│   └── health/
└── routes/
    └── index.js

```

## Workflow
develop → feature/* → develop → main

## Requirements
Before running the project, make sure you have installed:
Node.js (LTS recommended)
Docker Desktop
Git
DBeaver or another PostgreSQL client

## Environment Variables
Create a .env file in the root of the project with the following values:
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/collectoros_db?schema=public"
JWT_SECRET="super_secret_jwt_key"
JWT_REFRESH_SECRET="super_secret_refresh_key"

## Run PostgreSQL with Docker
This project uses PostgreSQL through Docker.

Start the database
docker compose up -d

Stop the database
docker compose down

Check running containers
docker ps

## Install Dependencies
npm install

## Prisma Commands
Generate Prisma Client
npx prisma generate

## Run migrations
npx prisma migrate dev --name init

## Open Prisma Studio
npx prisma studio

## Run the API
Development mode
npm run dev

Production mode
npm start

The API will run on:
http://localhost:3001

Available Scripts
{
  "dev": "nodemon src/app/server.js",
  "start": "node src/app/server.js",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio"
}

## API Base URL
/api/v1

## Available Endpoints
Health
GET /api/v1/health

Checks whether the API and database are running correctly.

## Auth
POST /api/v1/auth/register

Create a new user.

Example body:
{
  "email": "enrique@example.com",
  "password": "Password123",
  "displayName": "Enrique"
}

POST /api/v1/auth/login

Authenticate a user and return an access token.
Example body:
{
  "email": "enrique@example.com",
  "password": "Password123"
}

GET /api/v1/auth/me

Return the authenticated user.
Required header:
Authorization: Bearer <access_token>

## API Response Standard

Success response
{
  "ok": true,
  "message": "Request successful",
  "data": {}
}

Error response
{
  "ok": false,
  "message": "Something went wrong"
}

Validation error response
{
  "ok": false,
  "message": "Validation error",
  "errors": [
    {
      "path": "email",
      "message": "Email is invalid"
    }
  ]
}

## Coding Standards

All code is written in English

Comments may be written in Spanish

camelCase for variables and functions

PascalCase for classes

snake_case for database tables and columns

Layered architecture:

routes

controllers

services

repositories

schemas

Next Planned Modules

Inventory module

Wishlist module

Price history module

Analytics module

Redis and BullMQ integration

Refresh token flow

Swagger / OpenAPI documentation

Project Goal

CollectorOS API is intended to be both:

a real personal backend for collection management

a professional portfolio project demonstrating clean architecture, authentication, database design, and scalable backend practices





