export function errorHandler(err, req, res, _next) {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  const message =
    err.message || 'Something went wrong while processing your request.';
  res.status(status).json({
    error: message,
    path: req.originalUrl,
  });
}

