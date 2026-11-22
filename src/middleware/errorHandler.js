export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(error, req, res, next) {
  console.error(error);
  if (res.headersSent) return next(error);

  const status = Number.isInteger(error.status) ? error.status : 500;
  res.status(status).json({
    error: status >= 500 ? "Internal server error" : error.message,
  });
}
