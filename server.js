const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Your API Documentation',
        version: '1.0.0',
        description: 'Documentation for your backend endpoints',
      },
    },
    // Path to the API docs (you can use JSDoc comments in your code)
    apis: ['./routes/*.js', './controllers/*.js'], 
  };
  
  const swaggerSpec = swaggerJsdoc(options);
  
  // Setup the swagger route
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
