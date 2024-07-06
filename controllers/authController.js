const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Organization } = require('../models');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, phone } = req.body;

  try {
    // Check if the email or userId already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(422).json({
        errors: [{ field: 'email', message: 'Email already in use' }]
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await User.create({
      userId: `user-${Date.now()}`,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone
    });

    // Create the default organization
    const organization = await Organization.create({
      orgId: `org-${Date.now()}`,
      name: `${firstName}'s Organization`,
      description: `Organization for ${firstName}`
    });

    // Associate the user with the organization
    await user.addOrganization(organization);

    // Generate a JWT token
    const token = jwt.sign({ userId: user.userId, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
    const token = jwt.sign({ userId: user.userId, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
