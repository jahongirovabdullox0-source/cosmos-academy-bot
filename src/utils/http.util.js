function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

class ApiError extends Error {
  constructor(status, message, expose = true) {
    super(message);
    this.status = status;
    this.expose = expose;
  }
}

module.exports = { asyncHandler, ApiError };
