const errorHandler = (err, req, res, _next) => {
  console.error('[Error]', err.message);

  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'A record already exists for this entry' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Referenced record does not exist' });
  }
  if (err.code === '23514') {
    return res.status(400).json({ success: false, message: 'Value is out of allowed range' });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired, please log in again' });
  }
  if (err.type === 'StripeCardError') {
    return res.status(402).json({ success: false, message: err.message });
  }
  if (err.type === 'StripeInvalidRequestError') {
    return res.status(400).json({ success: false, message: 'Invalid payment request' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Max 5MB' });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};

export default errorHandler;
