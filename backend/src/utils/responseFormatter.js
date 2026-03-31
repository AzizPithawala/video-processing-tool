const success = (res, data = {}, message = '', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const error = (res, message = 'Server Error', code = 'SERVER_ERROR', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};

module.exports = { success, error };
