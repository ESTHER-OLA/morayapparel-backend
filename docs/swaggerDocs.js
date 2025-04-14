const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    servers: [
      {
        url: "https://morayapparel-backend.onrender.com", // This URL will be displayed in Swagger UI
        description: "Production server",
      },
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],
    info: {
      title: "Moray Apparel API Documentation",
      version: "1.0.0",
      description: "API endpoints for backend",
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // Optional, but good practice
        },
      },
    },
    // Uncomment this if you want all routes to be protected by default
    // security: [
    //   {
    //     BearerAuth: [],
    //   },
    // ],
  },
  apis: [path.join(__dirname, "swaggerRoutes.js")],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
module.exports = swaggerSpec;
