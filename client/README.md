# Digital Heroes — Client

React + Vite frontend for the Digital Heroes golf platform.

## Tech Stack

- **React 19** + **Vite**
- **React Router v6** — client-side routing
- **Tailwind CSS v4** — styling (via `@tailwindcss/vite` plugin)
- **Axios** — HTTP client with interceptors

## Getting Started

```bash
# Install dependencies
npm install

# Create env file
cp .env.example .env
# Edit .env — set VITE_API_URL to your Express server

# Start dev server (runs on :5173)
npm run dev
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ProtectedRoute.jsx
│   └── SubscriberRoute.jsx
├── context/             # React context providers
│   └── AuthContext.jsx
├── hooks/               # Custom React hooks
├── pages/               # Route-level page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   └── Dashboard.jsx
├── services/            # API layer
│   └── api.js           # Axios instance with auth interceptors
├── utils/               # Utility functions
├── App.jsx              # Router + providers
├── main.jsx             # React DOM mount
└── index.css            # Tailwind + design tokens
```

## Environment Variables

| Variable       | Description                           | Default                  |
| -------------- | ------------------------------------- | ------------------------ |
| `VITE_API_URL` | Express API server URL                | `http://localhost:5000`  |

## Scripts

| Command         | Description            |
| --------------- | ---------------------- |
| `npm run dev`   | Start Vite dev server  |
| `npm run build` | Production build       |
| `npm run preview` | Preview production build |
