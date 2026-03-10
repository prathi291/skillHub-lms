export function loggingMiddleware(req, res, next) {
  const startTime = Date.now();

  // Log response when it's sent
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    console.log(
      `[${timestamp}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
}

export default loggingMiddleware;
