# Digital Heroes — Server

Express.js API server for the Digital Heroes golf platform.

## Tech Stack

- **Node.js** + **Express.js**
- **Mongoose** ODM → **MongoDB Atlas**
- **JWT** (jsonwebtoken) + **bcryptjs** — authentication
- **express-validator** — request validation
- **Stripe** — payment/subscription processing
- **Helmet** + **CORS** — security

## Getting Started

```bash
# Install dependencies
npm install

# Create env file
cp .env.example .env
# Edit .env — set MONGODB_URI, JWT_SECRET, STRIPE_SECRET_KEY, etc.

# Start dev server with hot reload (runs on :5000)
npm run dev

# Or start production server
npm start
```

## Project Structure

```
src/
├── config/
│   ├── db.js             # MongoDB connection
│   └── stripe.js         # Stripe SDK init
├── controllers/
│   ├── authController.js
│   ├── scoreController.js
│   ├── drawController.js
│   ├── charityController.js
│   ├── winnerController.js
│   └── subscriptionController.js
├── middleware/
│   ├── verifyToken.js    # JWT auth guard
│   ├── errorHandler.js   # Centralised error handling
│   └── validate.js       # express-validator rules
├── models/
│   ├── User.js
│   ├── Score.js
│   ├── Draw.js
│   ├── DrawResult.js
│   ├── Charity.js
│   ├── CharityContribution.js
│   └── Winner.js
├── routes/
│   ├── auth.js           # POST /register, /login, GET /me, POST /logout
│   ├── scores.js
│   ├── draws.js
│   ├── charities.js
│   ├── winners.js
│   └── subscriptions.js
├── services/
│   ├── drawEngine.js     # Draw logic (placeholder)
│   ├── emailService.js   # Transactional emails (placeholder)
│   └── stripeService.js  # Stripe helpers (placeholder)
├── app.js                # Express app setup
└── server.js             # Entry point — connects DB & starts server
```

## API Routes

| Method | Path                     | Auth | Description                     |
| ------ | ------------------------ | ---- | ------------------------------- |
| POST   | `/api/auth/register`     | ✗    | Create account, return JWT      |
| POST   | `/api/auth/login`        | ✗    | Authenticate, return JWT        |
| GET    | `/api/auth/me`           | ✓    | Get current user from JWT       |
| POST   | `/api/auth/logout`       | ✓    | Placeholder for token blacklist |
| GET    | `/api/scores`            | ✓    | List user's scores              |
| POST   | `/api/scores`            | ✓    | Submit a score                  |
| GET    | `/api/draws`             | ✗    | List all draws                  |
| GET    | `/api/draws/:id`         | ✗    | Single draw with results        |
| GET    | `/api/charities`         | ✗    | List charities                  |
| GET    | `/api/charities/:slug`   | ✗    | Single charity by slug          |
| GET    | `/api/winners`           | ✗    | List recent winners             |
| POST   | `/api/subscriptions/checkout` | ✓ | Create checkout (placeholder) |
| GET    | `/api/subscriptions/status`   | ✓ | Subscription status (placeholder) |

## Environment Variables

| Variable               | Description                         |
| ---------------------- | ----------------------------------- |
| `MONGODB_URI`          | MongoDB Atlas connection string     |
| `JWT_SECRET`           | Secret key for signing JWTs         |
| `PORT`                 | Server port (default: 5000)         |
| `NODE_ENV`             | Environment (development/production)|
| `STRIPE_SECRET_KEY`    | Stripe secret API key               |
| `STRIPE_WEBHOOK_SECRET`| Stripe webhook signing secret       |
| `CLIENT_URL`           | Production frontend URL (for CORS)  |

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start with nodemon (hot reload)      |
| `npm start`     | Start production server              |
