const { QueryTypes } = require('sequelize');
const utils = require('../javascripts/utils.js');
class ProductService {
  constructor(db) {
    this.sequelize = db.sequelize;
    this.Product = db.Product;
    this.Brand = db.Brand;
    this.Category = db.Category;
  }
  async create(name, description, unitprice, quantity, imgurl, brandId, categoryId) {
    try {
      const brand = await this.Brand.findOne({ where: { id: brandId } });
      const category = await this.Category.findOne({ where: { id: categoryId } });

      if (!brand) utils.createAndThrowError(404, 'No brand with provided id exists', 'BrandNotFoundError');
      if (!category) utils.createAndThrowError(404, 'No category with provided id exists', 'CategoryNotFoundError');

      if (quantity < 0)
        utils.createAndThrowError(400, 'Cannot set Quantity to below 0', 'StockOutOfRangeError');

      if (unitprice < 0)
        utils.createAndThrowError(400, 'Cannot set PricePerUnit to below 0', 'PricePerUnitOutOfRangeError');

      await this.Product.create({
        name: name,
        description: description,
        unitprice: unitprice,
        quantity: quantity,
        imgurl: imgurl,
        BrandId: brand.id,
        CategoryId: category.id,
        date_added: new Date().toISOString().slice(0, 19).replace('T', ' ')
      });
    } catch (error) {
      console.error(error);
      if (error.name == 'SequelizeUniqueConstraintError')
        utils.createAndThrowError(409, 'Cannot create product - A product with the same name already exists', 'DuplicateRecordError');
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to create a product', 'InternalCreateProductError');
    }
  }
  async update(id, name, description, unitprice, quantity, imgurl, isdeleted, brandId, categoryId) {
    try {
      const product = await this.Product.findOne({ where: { id: id } });
      let brand = {}, category = {};

      if (!product)
        utils.createAndThrowError(404, 'Cannot update product - No product with provided id exists', 'ProductNotFoundError');

      if (brandId) brand = await this.Brand.findOne({ where: { id: brandId } })
      else brand.id = product.BrandId;

      if (categoryId) category = await this.Category.findOne({ where: { id: categoryId } })
      else category.id = product.CategoryId;

      if (!brand)
        utils.createAndThrowError(404, 'Cannot update product - No brand with provided id exists', 'BrandNotFoundError');

      if (!category)
        utils.createAndThrowError(404, 'Cannot update product - No category with provided id exists', 'CategoryNotFoundError');

      if (quantity < 0)
        utils.createAndThrowError(400, 'Cannot set quantity to below 0', 'StockOutOfRangeError');

      if (unitprice < 0)
        utils.createAndThrowError(400, 'Cannot set unitprice to below 0', 'UnitPriceOutOfRangeError');

      return await this.Product.update({ name: name, description: description, unitprice: unitprice, quantity: quantity, imgurl: imgurl, isdeleted: isdeleted, BrandId: brand.id, CategoryId: category.id }, { where: { id: id } });
    } catch (error) {
      console.error(error);
      if (error.name === 'SequelizeUniqueConstraintError')
        utils.createAndThrowError(409, 'Cannot update product - A product with the provided name already exists', 'DuplicateRecordError');
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to update product', 'InternalUpdateProductError');
    }
  }
  async delete(id) {
    try {
      const exists = await this.Product.findOne({ where: { id: id } });
      if (exists)
        await this.Product.update({ isdeleted: 1 }, { where: { id: id } });
      else utils.createAndThrowError(404, 'Cannot delete product - no product was found with provided id');
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to delete product', 'InternalDeleteProductError');
    }
  }
  async getAll(req) {
    const query = `
      SELECT
          Products.id,
          Products.name,
          Products.description,
          Products.quantity,
          Products.unitprice,
          Products.isdeleted,
          Products.imgurl,
          Products.date_added,
          Products.createdAt,
          Products.updatedAt,
          Products.BrandId,
          Products.CategoryId,
          Brands.name AS brand,
          Categories.name AS category
      FROM Products
      INNER JOIN Brands ON Products.BrandId = Brands.id
      INNER JOIN Categories ON Products.CategoryId = Categories.id
      ORDER BY Products.id ASC
      `

    try {
      const products = await this.sequelize.query(query, { type: QueryTypes.SELECT, replacements: { userMembershipId: req.user } });
      return products;
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An error has occurred while trying to get all products', 'InternalProductGetAllError');
    }
  }
  async getAllNonDeleted() {
    const query = `
      SELECT
          Products.id,
          Products.name,
          Products.description,
          Products.quantity,
          Products.unitprice,
          Products.isdeleted,
          Products.imgurl,
          Products.date_added,
          Products.createdAt,
          Products.updatedAt,
          Products.BrandId,
          Products.CategoryId,
          Brands.name AS brand,
          Categories.name AS category
      FROM Products
      INNER JOIN Brands ON Products.BrandId = Brands.id
      INNER JOIN Categories ON Products.CategoryId = Categories.id
      WHERE Products.isdeleted = 0
      ORDER BY Products.id ASC
      `
    try {
      const products = await this.sequelize.query(query, { type: QueryTypes.SELECT });
      return products;
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An error has occurred while trying to get products', 'InternalProductGetAllError');
    }
  }
  async getDeleted() {
    const query = `
    SELECT
          Products.id,
          Products.name,
          Products.description,
          Products.quantity,
          Products.unitprice,
          Products.isdeleted,
          Products.imgurl,
          Products.date_added,
          Products.createdAt,
          Products.updatedAt,
          Products.BrandId,
          Products.CategoryId,
          Brands.name AS brand,
          Categories.name AS category
    FROM Products
    INNER JOIN Brands ON Products.BrandId = Brands.id
    INNER JOIN Categories ON Products.CategoryID = Categories.id
    WHERE Products.isdeleted = 1
    ORDER BY Products.id ASC
    `
    try {
      const deleted = await this.sequelize.query(query, { type: QueryTypes.SELECT });
      return deleted;
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to get deleted products')
    }
  }
  async search(keyword = '', req) {
    try {
      const query = `
      SELECT 
        Products.id,
        Products.name,
        Products.description,
        Products.quantity,
        Products.unitprice,
        Products.isdeleted,
        Products.imgurl,
        Products.date_added,
        Products.createdAt,
        Products.updatedAt,
        Products.BrandId,
        Products.CategoryId,
        Brands.name AS brand,
        Categories.name AS category
      FROM Products
      INNER JOIN Brands ON Brands.id = Products.BrandId
      INNER JOIN Categories ON Categories.id = Products.CategoryId
      WHERE (Products.name LIKE :partial OR Brands.name LIKE :exact OR Categories.name LIKE :exact)
      ORDER BY Products.id ASC
        `
      const products = await this.sequelize.query(query, { type: QueryTypes.SELECT, replacements: { partial: `%${keyword}%`, exact: keyword } })
      const nonDeleted = products.filter(x => x.isdeleted == 0);
      if (req?.user?.role === 'Admin' && products)
        return products;

      else return nonDeleted;
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to search for product(s)', 'SearchProductError');
    }
  }
}

module.exports = ProductService;