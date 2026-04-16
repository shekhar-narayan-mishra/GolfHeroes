# Digital Heroes - Deployment Guide

This guide covers deploying the Digital Heroes platform to production.
We recommend **Vercel** for the Frontend (Client) and **Railway** or **Render** for the Backend (Server).

## 1. Environment Variables Preparation

### Server Variables
| Variable | Description |
|---|---|
| `PORT` | 5000 (Set by hosting provider usually) |
| `CLIENT_URL` | e.g. `https://digitalheroes.com` (Used for CORS and redirecting emails) |
| `MONGO_URI` | Production MongoDB Atlas connection string |
| `JWT_SECRET` | 64+ char random string |
| `STRIPE_SECRET_KEY` | Stripe Live Secret Key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Live Webhook Secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Name |
| `CLOUDINARY_API_KEY` | Cloudinary Key |
| `CLOUDINARY_API_SECRET` | Cloudinary Secret |
| `RESEND_API_KEY` | Resend production API key for emails |

### Client Variables
| Variable | Description |
|---|---|
| `VITE_API_URL` | Production server URL (e.g. `https://api.digitalheroes.com`) |

## 2. Server Deployment (Railway/Render)

### Using Railway.app:
1. Connect your GitHub repository to Railway.
2. Select the `/server` folder as the root directory for your service if you are using a monorepo setup, OR deploy the `server` folder specifically via CLI (`railway up`).
3. Under the Service Settings, configure the **Start Command** to: `npm start`
4. Enter all Server Environment variables listed above in the "Variables" tab.
5. Railway will provision a public URL. Update `VITE_API_URL` under your Client deployment to use this.

### MongoDB Atlas Setup
- Ensure your cluster's "Network Access" IP Whitelist is updated to allow connections from your server. For maximum security, explicitly whitelist the static IP of your Railway/Render instance. If not possible, you may allow `0.0.0.0/0` (Anywhere) but rely on a strong `MONGO_URI` credential.

## 3. Client Deployment (Vercel)

1. Connect your repository to Vercel.
2. In the project settings, set the **Framework Preset** to `Vite`.
3. Set the **Root Directory** to `client/`.
4. Enter the `VITE_API_URL` environment variable pointing to your deployed backend.
5. Deploy.

### Vercel Routing Configuration (`vercel.json`)
Since this is an SPA (Single Page Application) using `react-router-dom`, you need to ensure client-side routing works without throwing 404s on page refresh. create a `client/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
*(This is handled by Vite natively on Vercel now, but good practice if issues arise).*

## 4. Webhooks Configuration

1. Log into your Stripe Dashboard.
2. Go to **Developers > Webhooks**.
3. Add a new endpoint. Point the URL to your deployed server endpoint: `https://api.digitalheroes.com/api/webhooks/stripe`.
4. Select the events required:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Reveal the "Signing Secret" for this endpoint. Copy it and set it as your `STRIPE_WEBHOOK_SECRET` in your server environment variables.

## 5. Security Verification
- Ensure any dummy test users are purged from the Production DB.
- Ensure CORS in `app.js` correctly blocks origins other than `CLIENT_URL`.
- Generate fresh API keys if any were exposed during development.
