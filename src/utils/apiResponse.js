// Every successful response has the same shape:
//   { success: true, message: "...", data: ... }
//
// Every error response has the same shape (see middleware/errorHandler.js):
//   { success: false, message: "..." }

export function sendSuccess(res, data = null, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}
