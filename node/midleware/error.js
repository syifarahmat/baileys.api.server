import APIError from '../error/api';

export const handler = (error, req, res, next) => {
  const statusCode = error.statusCode ? error.statusCode : 500;
  res.setHeader('Content-Type', 'application/json');
  res.status(statusCode);
  res.json({
    code: statusCode,
    error: error.message,
  });
};

export const notFound = (req, res, next) => {
  const error = new APIError({
    error: 'Not found',
    status: 404,
  });
  return handler(error, req, res);
};
