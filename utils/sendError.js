// Standardized error response utility
module.exports = function sendError(res, status, message, error = null) {
  const response = { success: false, message };
  if (error && process.env.NODE_ENV !== 'production') {
    response.error = typeof error === 'string' ? error : error.message || error;
  }
  return res.status(status).json(response);
}; 