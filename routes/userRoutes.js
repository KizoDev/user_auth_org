const express = require('express');
const  {getUserById, getUserOrganizations} = require('../controllers/userController')
//const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:id', authMiddleware, getUserById);
router.get('/', authMiddleware, getUserOrganizations);

module.exports = router;
