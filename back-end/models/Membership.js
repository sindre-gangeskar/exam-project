module.exports = (sequelize, Sequelize) => {
  const Membership = sequelize.define('Membership', {
    name: { type: Sequelize.STRING, allowNull: false, unique: true },
    minrequirement: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    maxrequirement: { type: Sequelize.INTEGER, allowNull: true, defaultValue: 15 },
    discount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 }
  }, { timestamps: false })

  return Membership;
}