const { User, Organization } = require('../models');
const { validationResult } = require('express-validator');

exports.createOrganization = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { userId } = req.user; // Assuming req.user is set by authentication middleware
  const { name, description } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const organization = await Organization.create({
      orgId: `org-${Date.now()}`,
      name,
      description
    });

    await user.addOrganization(organization);

    res.status(201).json({
      status: 'success',
      message: 'Organization created successfully',
      data: {
        orgId: organization.orgId,
        name: organization.name,
        description: organization.description
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.getAllUserOrganizations = async (req, res) => {
  const { userId } = req.user; // Assuming req.user is set by authentication middleware

  try {
    const user = await User.findByPk(userId, {
      include: {
        model: Organization,
        through: {
          attributes: []
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Organizations retrieved successfully',
      data: {
        organizations: user.Organizations.map(org => ({
          orgId: org.orgId,
          name: org.name,
          description: org.description
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.getOrganizationById = async (req, res) => {
  const { orgId } = req.params;

  try {
    const organization = await Organization.findByPk(orgId);

    if (!organization) {
      return res.status(404).json({
        status: 'error',
        message: 'Organization not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Organization found',
      data: {
        orgId: organization.orgId,
        name: organization.name,
        description: organization.description
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.addUserToOrganization = async (req, res) => {
  const { orgId } = req.params;
  const { userId } = req.body;

  try {
    const organization = await Organization.findByPk(orgId);
    const user = await User.findByPk(userId);

    if (!organization || !user) {
      return res.status(404).json({
        status: 'error',
        message: 'User or Organization not found'
      });
    }

    await organization.addUser(user);

    res.status(200).json({
      status: 'success',
      message: 'User added to organization successfully'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
