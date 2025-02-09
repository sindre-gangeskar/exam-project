module.exports = (sequelize, Sequelize) => {
  const Cart = sequelize.define('Cart', {
    UserId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    ProductId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Products',
        key: 'id'
      },
    },
    quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
    unitprice: { type: Sequelize.FLOAT, allowNull: false },
  }, { timestamps: true })

  Cart.associate = function (models) {
    Cart.belongsTo(models.User, { foreignKey: 'UserId' });
    Cart.belongsTo(models.Product, { foreignKey: 'ProductId' });
  };

  return Cart;
}