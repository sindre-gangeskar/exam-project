module.exports = (sequelize, Sequelize) => {
  const Brand = sequelize.define('Brand', {
    name: { type: Sequelize.STRING, allowNull: false, unique: true },
  }, { timestamps: false })


  Brand.associate = function (models) {
    Brand.hasMany(models.Product, { foreignKey: 'BrandId', onDelete: 'restrict' });
  }
  return Brand;
}