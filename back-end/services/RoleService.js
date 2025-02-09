const utils = require('../javascripts/utils.js');
class RoleService {
  constructor(db) {
    this.sequelize = db.sequelize;
    this.Role = db.Role;
  }
  async getAll() {
    try {
      const roles = await this.Role.findAll({order: [['id', 'ASC']]});
      return roles;
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to get all roles', 'InternalGetAllRolesError');
    }
  }
}

module.exports = RoleService;