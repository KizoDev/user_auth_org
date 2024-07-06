const express = require('express');
const orgController = require('../controllers/orgController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, orgController.getAllUserOrganizations);
router.get('/:orgId', authMiddleware, orgController.getOrganizationById);
router.post('/', authMiddleware, orgController.createOrganization);
router.post('/:orgId/users', authMiddleware, orgController.addUserToOrganization);

module.exports = router;
