const utils = require('../javascripts/utils.js');
class CategoryService {
  constructor(db) {
    this.sequelize = db.sequelize;
    this.Category = db.Category;
  }
  async create(name) {
    try {
      await this.Category.create({ name: name });
    } catch (error) {
      console.error(error);
      if (error.name == 'SequelizeUniqueConstraintError')
        utils.createAndThrowError(409, 'Cannot create category - A category with provided category name already exists', 'DuplicateRecordError');
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to create category', 'InternalPostCategoryError')
    }
  }
  async getAll() {
    try {
      const categories = await this.Category.findAll({order: [['id', 'ASC']]});
      return categories;
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to get categories', 'InternalGetCategoriesError');
    }
  }
  async delete(id) {
    try {
      const category = await this.Category.findOne({ where: { id: id } });
      if (category) await this.Category.destroy({ where: { id: id } });
      else utils.createAndThrowError(404, 'Cannot delete category - Cannot find category with provided id', 'CategoryNotFoundError');
    } catch (error) {
      console.error(error);
      if (error.name == 'SequelizeForeignKeyConstraintError') utils.createAndThrowError(409, 'Cannot delete category - a product is using this category', 'CategoryDependencyError');
      else if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to delete category', 'InternalCategoryDeleteError');
    }
  }
  async update(id, name) {
    try {
      const category = await this.Category.findOne({ where: { id: id } });
      if (category) await this.Category.update({ name: name }, { where: { id: id } });
      else utils.createAndThrowError(404, 'Cannot update category - Category with provided id does not exist', 'CategoryNotFoundError');
    } catch (error) {
      console.error(error);
      if (error.name === 'SequelizeUniqueConstraintError')
        utils.createAndThrowError(409, 'Cannot update category - A category with provided category name already exists', 'DuplicateRecordError');

      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to update category', 'InternalCategoryUpdateError');
    }
  }
}

module.exports = CategoryService;