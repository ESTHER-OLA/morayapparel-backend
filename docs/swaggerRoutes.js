/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication related endpoints (user login, signup, Google OAuth, password reset)
 *   - name: User
 *     description: User profile management
 *   - name: Admin
 *     description: Admin authentication and dashboard access
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to email. Verify to complete signup.
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP to complete user or admin signup, or reset password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - purpose
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               purpose:
 *                 type: string
 *                 enum: [signup, reset-password]
 *                 example: signup
 *     responses:
 *       200:
 *         description: OTP verification successful.
 *       400:
 *         description: Invalid OTP, expired OTP, or other validation issue.
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to user or admin email for signup or password reset.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - purpose
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               purpose:
 *                 type: string
 *                 enum: [signup, reset-password]
 *                 example: signup
 *               isAdmin:
 *                 type: boolean
 *                 description: Set to true for admin OTP requests.
 *                 example: false
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid input or request
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login an existing verified user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns a JWT token and user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Invalid credentials or unverified account
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/google/signup/callback:
 *   get:
 *     summary: Handle Google OAuth Signup callback
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Returns JWT token and user info
 *       400:
 *         description: Google signup failed
 */

/**
 * @swagger
 * /api/auth/google/login:
 *   get:
 *     summary: Initiate Google OAuth for Login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google for authentication
 */

/**
 * @swagger
 * /api/auth/google/login/callback:
 *   get:
 *     summary: Handle Google OAuth Login callback
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Returns JWT token and user info
 *       400:
 *         description: Google login failed
 */

/**
 * @swagger
 * /api/admin/signup:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - secretKey
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               secretKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to email. Please verify to complete signup.
 *       400:
 *         description: Admin already exists or validation failed
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Login an admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - secretKey
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               secretKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials or unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/admin/password-reset-request:
 *   post:
 *     summary: Request OTP for password reset
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to email. Please verify to reset your password.
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Access the admin dashboard (protected route)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Welcome message from the admin dashboard
 *       401:
 *         description: Unauthorized, token not provided or invalid
 *       403:
 *         description: Forbidden, admin access only
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user profile details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update user profile details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               country:
 *                 type: string
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /products/upload:
 *   post:
 *     summary: Upload a new product
 *     description: Upload a new product along with an image. The image is handled via multipart/form-data.
 *     tags: [Products]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: The image file for the product.
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *         description: Name of the product.
 *       - in: formData
 *         name: price
 *         type: number
 *         required: true
 *         description: Price of the product.
 *       - in: formData
 *         name: sizes
 *         type: array
 *         items:
 *           type: string
 *         required: false
 *         description: Available sizes.
 *       - in: formData
 *         name: color
 *         type: string
 *         required: false
 *         description: Color of the product.
 *       - in: formData
 *         name: productDescription
 *         type: string
 *         required: false
 *         description: Description of the product.
 *       - in: formData
 *         name: productAttributes
 *         type: array
 *         items:
 *           type: string
 *         required: true
 *         description: Attributes for the product. Must be an array.
 *       - in: formData
 *         name: productStatus
 *         type: string
 *         enum: [available, available-on-request]
 *         required: true
 *         description: The status of the product.
 *       - in: formData
 *         name: genderCategory
 *         type: string
 *         enum: [men-outfit, female-outfit]
 *         required: true
 *         description: The gender category for the product.
 *       - in: formData
 *         name: subCategory
 *         type: string
 *         enum: [classic, casual, business, joggers, sport, elegant, formal]
 *         required: true
 *         description: The subcategory for the product.
 *       - in: formData
 *         name: shipping
 *         type: string
 *         required: true
 *         description: Shipping value, can be 'free' or a numeric string.
 *     responses:
 *       201:
 *         description: Product uploaded successfully.
 *       400:
 *         description: Bad request due to invalid input.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /products/{genderCategory}/{subCategory}:
 *   get:
 *     summary: Get products by category
 *     description: Retrieve products based on gender category and subcategory.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: genderCategory
 *         required: true
 *         schema:
 *           type: string
 *         description: Gender category (men-outfit or female-outfit).
 *       - in: path
 *         name: subCategory
 *         required: true
 *         schema:
 *           type: string
 *         description: Subcategory (classic, casual, business, joggers, sport, elegant, formal).
 *     responses:
 *       200:
 *         description: List of products matching the category.
 *       404:
 *         description: No products found in this category.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /products/all:
 *   get:
 *     summary: Get all products
 *     description: Retrieve all products in the database.
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /products/{productId}/reviews:
 *   post:
 *     summary: Add a review to a product
 *     description: Add a review with a comment and rating to a product.
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product.
 *       - in: body
 *         name: review
 *         description: Review object containing comment and rating.
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - comment
 *             - rating
 *           properties:
 *             comment:
 *               type: string
 *             rating:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *     responses:
 *       201:
 *         description: Review added successfully.
 *       400:
 *         description: Comment and rating are required or rating out of bounds.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /products/{productId}/reviews:
 *   get:
 *     summary: Get reviews for a product
 *     description: Retrieve all reviews for a specified product.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product.
 *     responses:
 *       200:
 *         description: List of reviews.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart operations
 */

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add a product to the cart
 *     description: Adds a product along with the desired quantity to the user's cart.
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: body
 *         name: cartItem
 *         description: Object containing productId and quantity.
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - productId
 *             - quantity
 *           properties:
 *             productId:
 *               type: string
 *             quantity:
 *               type: integer
 *     responses:
 *       200:
 *         description: Product added to cart successfully.
 *       400:
 *         description: Product ID is missing or quantity is invalid.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get the user's cart
 *     description: Retrieve the current cart for the authenticated user.
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the user's cart, or a message if the cart is empty.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /cart/remove:
 *   post:
 *     summary: Remove a product from the cart
 *     description: Removes a specified product from the user's cart.
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: body
 *         name: cartItem
 *         description: Object containing the productId to be removed.
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - productId
 *           properties:
 *             productId:
 *               type: string
 *     responses:
 *       200:
 *         description: Product removed from cart successfully.
 *       404:
 *         description: Cart not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear the entire cart
 *     description: Removes all items from the user's cart.
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * /orders/place:
 *   post:
 *     summary: Place an order
 *     description: Place an order with the current items in the user's cart. Optionally, use a saved address or provide a new one.
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: body
 *         name: order
 *         description: Order details.
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - deliveryAddress
 *           properties:
 *             deliveryAddress:
 *               type: string
 *             useSavedAddress:
 *               type: boolean
 *             saveNewAddress:
 *               type: boolean
 *     responses:
 *       201:
 *         description: Order placed successfully.
 *       400:
 *         description: Cart is empty or invalid input.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /orders/user-orders:
 *   get:
 *     summary: Get user orders
 *     description: Retrieve orders placed by the authenticated user.
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders for the user.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /orders/all-orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     description: Retrieve all orders in the system. This endpoint is restricted to admin users.
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /orders/update/{orderId}:
 *   put:
 *     summary: Update order status (Admin only)
 *     description: Update the status of an order by order ID.
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to update.
 *       - in: body
 *         name: order
 *         description: Object containing the new order status.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             orderStatus:
 *               type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully.
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /orders/notifications:
 *   get:
 *     summary: Get new order notifications (Admin only)
 *     description: Retrieve all unread order notifications.
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of unread notifications.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing endpoints
 */

/**
 * @swagger
 * /payments/initiate:
 *   post:
 *     summary: Initiate a payment transaction
 *     description: Initiates a payment transaction using a credit card via Paystack for a specific order.
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Order details for payment initiation.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The ID of the order for which payment is being made.
 *     responses:
 *       200:
 *         description: Payment initiated successfully. Returns the Paystack authorization URL and payment record ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authorization_url:
 *                   type: string
 *                   description: URL where the customer can authorize the payment.
 *                 paymentId:
 *                   type: string
 *                   description: The unique ID of the created payment record.
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Process payment status updates via webhook
 *     description: Receives webhook events from Paystack to update the payment status (success or failure) and create notifications.
 *     tags: [Payments]
 *     requestBody:
 *       description: Payload from Paystack containing payment event data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: The event type (e.g., "charge.success" or "charge.failed").
 *               data:
 *                 type: object
 *                 properties:
 *                   reference:
 *                     type: string
 *                     description: The unique transaction reference from Paystack.
 *                   # Additional properties from Paystack can be added here as needed.
 *     responses:
 *       200:
 *         description: Webhook event processed successfully.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /payments/receipt/{paymentId}:
 *   get:
 *     summary: Retrieve payment receipt
 *     description: Returns a detailed receipt for a successful payment, including order, user, and payment details.
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment record.
 *     responses:
 *       200:
 *         description: Receipt retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 receipt:
 *                   type: object
 *                   properties:
 *                     receiptNumber:
 *                       type: string
 *                       description: The transaction reference number.
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       description: Date when the payment was made.
 *                     amount:
 *                       type: number
 *                       description: Payment amount.
 *                     status:
 *                       type: string
 *                       description: Payment status (e.g., "pending", "success", or "failed").
 *                     orderDetails:
 *                       type: object
 *                       description: Details of the associated order.
 *                     user:
 *                       type: object
 *                       description: Details of the user who made the payment.
 *                     paymentDetails:
 *                       type: object
 *                       description: Additional details returned from Paystack regarding the payment.
 *       404:
 *         description: Payment not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/auth/delete-account:
 *   delete:
 *     summary: Delete a user or admin account
 *     description: Deletes a user or admin account based on first name, last name, user ID, and password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userFirstName
 *               - userLastName
 *               - userId
 *               - password
 *             properties:
 *               userFirstName:
 *                 type: string
 *                 example: Esther
 *                 description: First name of the user
 *               userLastName:
 *                 type: string
 *                 example: Ola
 *                 description: Last name of the user
 *               userId:
 *                 type: string
 *                 example: 660f9d23e7812a6cf5e7f1cd
 *                 description: Unique ID of the user
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mySecret123!
 *                 description: User's password for verification
 *     responses:
 *       200:
 *         description: Account deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account deleted successfully
 *       400:
 *         description: Invalid input or user not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials or user not found
 *       401:
 *         description: Unauthorized - Incorrect password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password does not match
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 *                   example: Detailed error message
 */

/**
 * @swagger
 * /api/admin/get-all-accounts:
 *   get:
 *     summary: Get all user and admin accounts
 *     description: Fetches all user and admin accounts, listing them separately with their roles.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []  # Ensure that the request includes a valid JWT token in the Authorization header
 *     responses:
 *       200:
 *         description: Successfully fetched user and admin accounts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fetched users and admins successfully
 *                 userAccounts:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 5
 *                       description: Total number of user accounts
 *                     accounts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 60d5f64b3b2f3c1e6c342fff
 *                             description: Unique user ID
 *                           firstName:
 *                             type: string
 *                             example: John
 *                             description: First name of the user
 *                           lastName:
 *                             type: string
 *                             example: Doe
 *                             description: Last name of the user
 *                           email:
 *                             type: string
 *                             example: johndoe@example.com
 *                             description: Email of the user
 *                           role:
 *                             type: string
 *                             example: user
 *                             description: Role of the account (user/admin)
 *                 adminAccounts:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 2
 *                       description: Total number of admin accounts
 *                     accounts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 60d5f64b3b2f3c1e6c342abc
 *                             description: Unique admin ID
 *                           firstName:
 *                             type: string
 *                             example: Admin
 *                             description: First name of the admin
 *                           lastName:
 *                             type: string
 *                             example: Admin
 *                             description: Last name of the admin
 *                           email:
 *                             type: string
 *                             example: admin@example.com
 *                             description: Email of the admin
 *                           role:
 *                             type: string
 *                             example: admin
 *                             description: Role of the account (user/admin)
 *       401:
 *         description: Unauthorized. Admin authentication failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized. Token is missing or invalid.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 *                   example: Detailed error message
 */
