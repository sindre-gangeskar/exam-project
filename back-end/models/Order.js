module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define('Order', {
    ordernumber: { type: Sequelize.STRING, unique: true, allowNull: false },
    membershipid: { type: Sequelize.INTEGER, allowNull: false }
  }, { timestamps: true })

  Order.associate = function (models) {
    Order.belongsTo(models.User);
    Order.belongsTo(models.Status);
  }

  return Order;
}