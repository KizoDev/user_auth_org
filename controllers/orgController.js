const { model } = require('mongoose');
const { User, Organization } = require('../models');

const { validationResult } = require('express-validator');

exports.createOrganization = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { userId } = req.user;
  const { name, description } = req.body;

  try {
    const user = await User.findOne({
     where:{ userId: userId}
    });

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
    console.log(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.getAllUserOrganizations = async (req, res) => {
  const user  = req.user; 

  try {
    const organizations = await Organization.findAll({ 
      include:{
        model:User,
        where: { userId: user.userId }
      }
      
    });
   // console.log(organizations);
     if (!organizations) {
      return res.status(404).json({
         status: 'error',
         message: 'User not found'
     });
     }

     res.status(200).json({
       status: 'success',
    message: 'Organizations retrieved successfully',    
    data:organizations.map(org => ({
      orgId: org.orgId,
      name: org.name,
      description: org.description
    }))
    });
    
  } catch (error) {
    //console.log(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });

  }
};

exports.getOrganizationById = async (req, res) => {
  const {id:orgId}  = req.params;
  const user  = req.user; 

  try {
    const organization = await Organization.findOne({
      where: { orgId: orgId },
      include: {
        model: User,
        where: { userId: user.userId },
        through: { attributes: [] }
      }
    });
   
    //console.log(organization);
    if (!organization) {
      return res.status(404).json({
        status: 'error',
      });
    }
    res.status(200).json({
      status: 'success',
   message: 'Organizations retrieved successfully',    
   data:{ 
    orgId:organization.orgId,
     name:organization.name,
     description:organization.description
   }
    });
  } catch (error) {
    //console.log(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

exports.addUserToOrganization = async (req, res) => {
  const { orgId } = req.params;
  const { userId } = req.body;

  try {
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Find the organization by orgId
    const organization = await Organization.findOne({ where: { orgId } });
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Add the user to the organization
    await user.addOrganization(organization);

    res.status(200).json({
      status: 'success',
      message: 'User added to organization successfully'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
