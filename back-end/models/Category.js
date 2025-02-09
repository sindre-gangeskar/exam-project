module.exports = (sequelize, Sequelize) => {
  const Category = sequelize.define('Category', {
    name: { type: Sequelize.STRING, allowNull: false, unique: true }
  }, { timestamps: false })

  Category.associate = function (models) {
    Category.hasMany(models.Product, { foreignKey: 'CategoryId', onDelete: 'restrict' });
  }

  return Category;
}