module.exports = (sequelize, DataTypes) => {
    const Organization = sequelize.define('Organization', {
      orgId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: DataTypes.STRING
    }, {});
  
    Organization.associate = (models) => {
      Organization.belongsToMany(models.User, {
        through: 'UserOrganizations',
        foreignKey: 'orgId'
      });
    };
  
    return Organization;
  };
  