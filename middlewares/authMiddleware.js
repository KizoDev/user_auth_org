const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Ensure you are using the correct import path for your User model
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  try {
     const authHeader = req.header('Authorization');
    
     if (!authHeader) {
     return res.status(401).json({ status: 'error', message: 'Authorization header missing' });
     }

    const token = authHeader.replace('Bearer ', '');
    //console.log(token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(decoded);

    // const user = await User.findOne(decoded.id);
    // console.log(user);
    // if (!user) {
    //   return res.status(401).json({ status: 'error', message: 'Authentication failed' });
    // }

     req.user = decoded;
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
}

module.exports = authMiddleware;
