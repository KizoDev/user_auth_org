const express = require('express');
const orgController = require('../controllers/orgController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/organisations',authMiddleware, orgController.getAllUserOrganizations);
router.get('/organisations/:id',authMiddleware, orgController.getOrganizationById);
router.post('/organisations', authMiddleware, orgController.createOrganization);
router.post('/organisations/:orgId/users', authMiddleware, orgController.addUserToOrganization);

module.exports = router;
