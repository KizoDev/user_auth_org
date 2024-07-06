const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    check('firstName').not().isEmpty().withMessage('First name is required'),
    check('lastName').not().isEmpty().withMessage('Last name is required'),
    check('email').isEmail().withMessage('Please include a valid email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  authController.register
);

router.post('/login', authController.login);

module.exports = router;
