export function errorHandlingMiddleware(err, req, res, next) {
  console.error('Error:', err);

  // Default error response
  const response = {
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  };

  // Add details in development
  if (process.env.NODE_ENV === 'development') {
    response.details = err.stack;
  }

  // Determine status code
  let statusCode = err.statusCode || 500;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    response.code = 'VALIDATION_ERROR';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    response.code = 'NOT_FOUND';
  }

  res.status(statusCode).json(response);
}

export default errorHandlingMiddleware;
