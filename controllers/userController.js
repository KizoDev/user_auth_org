const { User, Organization } = require('../models');

const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
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
      message: 'User found',
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
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

const getUserOrganizations = async (req, res) => {
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

module.exports = {getUserById, getUserOrganizations};