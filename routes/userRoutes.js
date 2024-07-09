const express = require('express');
const  {getUserById, getUserOrganizations} = require('../controllers/userController')
//const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/users/:id',authMiddleware, getUserById);
router.get('/users/', authMiddleware, getUserOrganizations);

module.exports = router;
