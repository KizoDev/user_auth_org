const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      status: 'Bad request',
      message: 'Access denied, no token provided',
      statusCode: 401
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({
      status: 'Bad request',
      message: 'Invalid token',
      statusCode: 400
    });
  }
};
