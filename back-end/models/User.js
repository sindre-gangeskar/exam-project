module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('User', {
    firstname: { type: Sequelize.STRING, allowNull: false },
    lastname: { type: Sequelize.STRING, allowNull: false },
    email: { type: Sequelize.STRING, alloWNull: false, unique: true },
    address: { type: Sequelize.STRING, allowNull: false },
    phone: { type: Sequelize.STRING, allowNull: false },
    username: { type: Sequelize.STRING, allowNull: false, unique: true },
    password: { type: Sequelize.BLOB, allowNull: false },
    totalPurchases: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    salt: { type: Sequelize.BLOB, allowNull: false }
  }, { timestamps: true, })

  User.associate = function (models) {
    User.belongsTo(models.Membership, { foreignKey: 'MembershipId', allowNull: false, onDelete: 'restrict' });
    User.belongsTo(models.Role, { foreignKey: 'RoleId', allowNull: false, onDelete: 'restrict' });
  }

  return User;
}