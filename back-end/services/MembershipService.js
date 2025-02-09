const utils = require('../javascripts/utils.js');
class MembershipService {
  constructor(db) {
    this.sequelize = db.sequelize;
    this.Membership = db.Membership;
  }
  async getAll() {
    try {
      const memberships = await this.Membership.findAll({order: [['id', 'ASC']]});
      return memberships;
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to get memberships', 'InternalGetMembershipsError');
    }
  }
}

module.exports = MembershipService;