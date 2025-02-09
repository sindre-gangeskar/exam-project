const utils = require('../javascripts/utils.js');
class BrandService {
  constructor(db) {
    this.sequelize = db.sequelize;
    this.Brand = db.Brand;
  }
  async getAll() {
    try {
      const brands = await this.Brand.findAll({ order: [ [ 'id', 'ASC' ] ] });
      return brands;
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to get all brands', 'InternalGetBrandsError');
    }
  }
  async create(name) {
    try {
      await this.Brand.create({ name: name });
    } catch (error) {
      console.error(error);
      if (error.name == 'SequelizeUniqueConstraintError') utils.createAndThrowError(409, 'Brand with provided name already exists', 'DuplicateRecordError');
      else if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to create a brand', 'BrandPostError');
    }
  }
  async update(id, name) {
    try {
      const brand = await this.Brand.findOne({ where: { id: id } });
      if (brand)
        return await this.Brand.update({ name: name }, { where: { id: id } });
      else utils.createAndThrowError(404, 'Cannot update brand - Brand with provided id does not exist', 'BrandNotFoundError');
    } catch (error) {
      console.error(error);
      if (error.name == 'SequelizeUniqueConstraintError')
        utils.createAndThrowError(409, 'Cannot update brand - another brand with the same name already exists', 'DuplicateRecordError');
      else if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to update brand', 'InternalBrandUpdateError');
    }
  }
  async delete(id) {
    try {
      const brand = await this.Brand.findOne({ where: { id: id } });
      if (brand)
        await this.Brand.destroy({ where: { id: id } });
      else utils.createAndThrowError(404, 'Cannot find brand with provided id', 'BrandNotFoundError');
    } catch (error) {
      console.error(error);
      if (error.name == 'SequelizeForeignKeyConstraintError')
        utils.createAndThrowError(409, 'Cannot delete brand - a product is using this brand', 'BrandDependencyError');
      else if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to delete brand', 'InternalBrandDeleteError');
    }
  }
}

module.exports = BrandService;