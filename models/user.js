module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      userId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: DataTypes.STRING
    }, {});
  
    User.associate = (models) => {
      User.belongsToMany(models.Organization, {
        through: 'UserOrganizations',
        foreignKey: 'userId'
      });
    };
  
    return User;
  };
  