// The last middleware in app.js. Every error ends up here.
// Express 5 forwards errors from async route handlers automatically.

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // If a response was already started, let Express close the connection.
  if (res.headersSent) {
    return next(err);
  }

  // Bad JSON in the request body (thrown by express.json()).
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body",
    });
  }

  const statusCode = err.statusCode || err.status || 500;

  if (statusCode >= 500) {
    // Log the full error for the developer, but never send internal details to the client.
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message,
  });
}
