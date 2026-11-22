# Project instructions

## Backend

- This project uses Express.js, JavaScript ES modules, and the MongoDB Node.js driver.
- Keep HTTP setup in `src/app.js`, startup and shutdown in `src/server.js`, MongoDB setup in `src/config/database.js`, routes in `src/routes/`, and shared middleware in `src/middleware/`.
- Keep new domain code simple. Add modules only when a feature needs them; avoid repository or service layers by default.
- Use environment variables for configuration. Keep real credentials in `.env` (ignored by Git) and document variable names with safe local examples in `.env.example`.
- `GET /api/health` is the basic liveness check. The server currently requires a successful MongoDB connection before it starts listening.

## Completed backend foundation

- Added CORS, JSON parsing, 404 responses, and basic error handling.
- Added MongoDB connection setup and graceful shutdown.
- Added `GET /api/health` and retained `GET /services`.
- Added `start` and `dev` npm scripts and ignored local environment files.

## Recommended next step

Add the first focused user or booking endpoint with input validation and a small integration test, using the existing MongoDB connection.
