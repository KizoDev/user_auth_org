const { User, Organization } = require('../models');
 
const getUserById = async (req, res) => {
  const { id: userId } = req.params;
 
  try {
    const user = await User.findOne({
      where: { userId: userId },
      include: {
        model: Organization,
        through: {
          attributes: [],
        },
      },
    });
 
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
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
        organizations: user.Organizations.map((org) => ({
          orgId: org.orgId,
          name: org.name,
          description: org.description,
        })),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
 
const getUserOrganizations = async (req, res) => {
  const user = req.user; 
 
  try {
    const organization = await user.find({
    });
 
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }
 
    res.status(200).json({
      status: 'success',
      message: 'Organizations retrieved successfully',
      data: {
        organizations: user.Organizations.map((org) => ({
          orgId: org.orgId,
          name: org.name,
          description: org.description,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
 
module.exports = { getUserById, getUserOrganizations };