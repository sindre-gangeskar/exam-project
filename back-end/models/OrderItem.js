module.exports = (sequelize, Sequelize) => {
  const OrderItem = sequelize.define('Order_Item', {
    OrderId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Orders', key: 'id' } },
    ProductId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Products', key: 'id' } },
    quantity: { type: Sequelize.INTEGER, allowNull: false },
    ordernumber: { type: Sequelize.STRING, allowNull: false },
    unitprice: { type: Sequelize.FLOAT, allowNull: false },
  }, { timestamps: false })

  OrderItem.associate = function (models) {
    OrderItem.belongsTo(models.Product);
    OrderItem.belongsTo(models.Order);
  }

  return OrderItem;
}