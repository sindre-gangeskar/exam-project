module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define('Role', {
    name: { type: Sequelize.STRING, allowNull: false, unique: true }
  }, { timestamps: false })

  return Role;
}