const express = require('express');
const authRoutes = require('./authRoutes');
const orgRoutes = require('./orgRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/organizations', orgRoutes);
router.use('/users', userRoutes);

module.exports = router;
