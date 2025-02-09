const utils = require('../javascripts/utils');
class StatusService {
  constructor(db) {
    this.sequelize = db.sequelize;
    this.Status = db.Status;
  }
  async getAll() {
    try {
      const statuses = await this.Status.findAll({ order: [ [ 'id', 'ASC' ] ] });
      return statuses;
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to get all statuses', 'InternalGetAllStatusesError');
    }
  }
}

module.exports = StatusService;