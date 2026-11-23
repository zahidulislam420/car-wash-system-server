// An error with an HTTP status code.
// Throw it from any route and the error handler sends it to the client.
//
// Example: throw new ApiError(404, "Service not found");

export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}
