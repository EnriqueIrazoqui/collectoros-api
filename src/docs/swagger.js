const swaggerJsdoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.4",
  info: {
    title: "CollectorOS API",
    version: "1.0.0",
    description:
      "Backend API for CollectorOS, a personal collection management platform.",
  },
  servers: [
    {
      url: "http://localhost:3001/api/v1",
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["email", "password", "displayName"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "enrique@example.com",
          },
          password: {
            type: "string",
            example: "Password123",
          },
          displayName: {
            type: "string",
            example: "Enrique",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "enrique@example.com",
          },
          password: {
            type: "string",
            example: "Password123",
          },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          ok: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Request successful",
          },
          data: {
            type: "object",
            nullable: true,
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          ok: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "Something went wrong",
          },
        },
      },
      ValidationErrorResponse: {
        type: "object",
        properties: {
          ok: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "Validation error",
          },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  example: "email",
                },
                message: {
                  type: "string",
                  example: "Email is invalid",
                },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: "Health", description: "Health check endpoints" },
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Inventory", description: "Inventory management endpoints" },
    { name: "Price History", description: "Price tracking history endpoints" },
    { name: "Wishlist", description: "Wishlist management endpoints" },
    { name: "Analytics", description: "Analytics summary endpoints" },
    { name: "Alerts", description: "Alerts and opportunities endpoints" },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
    "./src/modules/**/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;