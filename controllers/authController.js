const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Organization } = require('../models');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, phone } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(422).json({
        errors: [{ field: 'email', message: 'Email already in use' }]
      });
    }

    let hashedPassword;
    try {
      // Hash the password
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

    let user;
    try {
      // Create the user
      user = await User.create({
        userId: `${Date.now()}`,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone
      });
    } catch (createUserError) {
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

    let organization;
    try {
      // Create the default organization
      organization = await Organization.create({
        orgId: `${Date.now()}`,
        name: `${firstName}'s Organization`,
        description: `Organization for ${firstName}`
      });
    } catch (createOrgError) {
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

    try {
      // Associate the user with the organization
      await user.addOrganization(organization);
    } catch (associateOrgError) {
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

    let token;
    try {
      // Generate a JWT token
      token = jwt.sign({ userId: user.userId, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    } catch (tokenError) {
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};


exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401
      });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401
      });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.userId, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};



