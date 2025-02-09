module.exports = (sequelize, Sequelize) => {
  const Status = sequelize.define('Status', {
    name: { type: Sequelize.STRING, unique: true }
  }, { timestamps: false })

  return Status;
}