module.exports = (sequelize, Sequelize) => {
  const Product = sequelize.define('Product', {
    name: { type: Sequelize.STRING, allowNull: false, unique: true },
    description: { type: Sequelize.STRING, allowNull: false },
    unitprice: { type: Sequelize.FLOAT, allowNull: false },
    quantity: { type: Sequelize.INTEGER, allowNull: false },
    isdeleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: 0 },
    imgurl: { type: Sequelize.STRING, allowNull: true, defaultValue: '' },
    date_added: { type: Sequelize.DATE, allowNull: true }
  }, { timestamps: true })

  Product.associate = function (models) {
    Product.belongsTo(models.Category);
    Product.belongsTo(models.Brand);
  }

  return Product;
}