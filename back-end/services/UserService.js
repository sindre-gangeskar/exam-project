const utils = require('../javascripts/utils.js');
const { Op, QueryTypes } = require('sequelize');
class UserService {
  constructor(db) {
    this.sequelize = db.sequelize;
    this.User = db.User;
    this.Role = db.Role;
    this.Membership = db.Membership;
  }
  async create(username, password, email, firstname, lastname, address, phone) {
    try {
      const { hashedPassword, salt } = utils.hashPassword(password);

      const membership = await this.Membership.findOne({ where: { name: 'Bronze' } });
      const role = await this.Role.findOne({ where: { name: 'User' } });

      /* Remove any white-spaces in the phone value using a regex */
      const formattedPhone = removeWhiteSpaces(phone);
      if (membership && role)
        return await this.User.create({ username: username, password: hashedPassword, salt: salt, email: email.toLowerCase(), firstname: firstname, lastname: lastname, address: address, phone: formattedPhone, MembershipId: membership.dataValues.id, RoleId: role.dataValues.id, totalPurchases: 0 });
      else {
        console.error('Role or User records do not exist, please check database records');
        utils.createAndThrowError(500, 'An internal server error has occurred while trying to create user', 'UserPostInternalServerError');
      }
    } catch (error) {
      if (error.name == 'SequelizeUniqueConstraintError')
        utils.createAndThrowError(409, 'A user with email or username already exists', 'DuplicateRecordError');

      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to create user', 'UserPostInternalServerError');
    }
  }
  async getAll() {
    try {
      const users = await this.User.findAll({ include: [ { model: this.Role }, { model: this.Membership } ] });

      const formatted = users.map(user => ({ id: user.id, username: user.username, firstname: user.firstname, lastname: user.lastname, email: user.email, address: user.address, phone: user.phone, totalPurchases: user.totalPurchases, createdAt: user.createdAt, updatedAt: user.updatedAt, RoleId: user.RoleId, role: user.Role.name, MembershipId: user.MembershipId, membership: user.Membership.name }))
      return formatted;
    } catch (error) {
      console.error(error);
      if (error.status) throw error;

      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to get all users', 'InternalUsersGetError');
    }
  }
  async getOne(username = '', email = '') {
    try {
      /* 
      Include the role in the user when fetching to assign the role property into the jwt token when signed 
      Find the user by either username or email - should return the same user regardless of which is used.
      */
      const user = await this.User.findOne(
        {
          where: { [ Op.or ]: [ { username: username }, { email: email.toLowerCase() } ] },
          include: [ { model: this.Role, key: 'name', attributes: [ 'name' ] } ]
        });

      if (user) return user;
      else return utils.createAndThrowError(404, 'No user with provided username or email exists', 'UserNotFoundError');
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else return utils.createAndThrowError(500, 'An internal server error has occurred while trying to find user data', 'InternalUserGetOneError');
    }
  }
  async getOneById(id) {

    try {
      const query = `
      SELECT
        Users.id,
        Users.username,
        Users.firstname,
        Users.lastname,
        Users.email,
        Users.address,
        Users.phone,
        Users.totalPurchases,
        Users.createdAt,
        Users.updatedAt,
        Users.RoleId,
        Roles.name AS role,
        Users.MembershipId,
        Memberships.name AS membership
      FROM Users
      INNER JOIN Memberships ON Users.MembershipId = Memberships.id
      INNER JOIN Roles ON Users.RoleId = Roles.id
      WHERE Users.id = :id
      `
      const user = await this.sequelize.query(query, { type: QueryTypes.SELECT, replacements: { id: id } });
      if (user.length > 0) return user[ 0 ];
      else utils.createAndThrowError(404, 'No user with provided id exists', 'UserNotFoundError');
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to get user with provided id', 'InternalUserGetOneByIdError');
    }
  }
  async update(userId, roleId, firstname, lastname, email, address, phone) {
    try {
      let role = {};
      const user = await this.User.findOne({ where: { id: userId } });

      if (!user)
        utils.createAndThrowError(404, 'No user with provided id exists', 'UserNotFoundError');

      /* If a new role is specified, find the role, else use the user's existing role id */
      if (!roleId) role.id = user.RoleId;
      else role = await this.Role.findOne({ where: { id: roleId } });

      if (!role)
        utils.createAndThrowError(404, 'No role with provided id exists', 'RoleNotFoundError');

      /* Remove any white-spaces in the phone value using a regex */
      if (phone) phone = removeWhiteSpaces(phone);
      return await this.User.update({ RoleId: role.id, firstname: firstname, lastname: lastname, email: email ? email.toLowerCase() : email, address: address, phone: phone }, { where: { id: user.id } });
    } catch (error) {
      console.error(error);
      if (error.name === 'SequelizeUniqueConstraintError')
        utils.createAndThrowError(409, 'Cannot update user - The email provided is already in use by another user', 'DuplicateRecordError')
      
      if (error.status) throw error;
      else return utils.createAndThrowError(500, 'An internal server error has occurred while trying to update user data', 'InternalUpdateUserError');
    }
  }
  async delete(userId) {
    try {
      const user = await this.User.findOne({ where: { id: userId } });
      if (user) await this.User.destroy({ where: { id: userId } });
      else utils.createAndThrowError(404, 'Cannot delete - No user with provided id exists', 'UserNotFoundError');
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to delete user', 'InternalDeleteUserError');
    }

  }
  async trackMembership(totalPurchases, memberships) {
    /* 
      Track the membership by checking the thresholds between each membership tier and return the specified membership id the user should be given
      based on the user's total purchases.
    */
    for (const [ key ] of Object.entries(memberships)) {
      /* return the membership that has a minimum and maximum requirement and the user's total purchases is within the threshold */
      if (memberships[ key ].minrequirement && memberships[ key ].maxrequirement) {
        if (totalPurchases > memberships[ key ].minrequirement && totalPurchases < memberships[ key ].maxrequirement) {
          return memberships[ key ].id;
        }
      }
      /* If the tier has no max requirement e.g the very last top tier */
      if (!memberships[ key ].maxrequirement && totalPurchases > memberships[ key ].minrequirement) {
        return memberships[ key ].id;
      }
    }
    /* If the loop's conditions don't meet, return false to indicate the user doesn't meet the requirements */
    return false;
  }
  async updateTotalPurchases(userId, totalPurchases) {
    try {
      const user = await this.User.findOne({ where: { id: userId } });
      if (user) await this.User.update({ totalPurchases: totalPurchases }, { where: { id: userId } });
      else utils.createAndThrowError(404, 'Cannot find user with provided id', 'UserNotFoundError');
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to update user total purchases', 'InternalUserTotalPurchasesUpdateError');
    }
  }
  async calculateDiscount(user, unitprice) {
    try {
      const membership = await this.Membership.findOne({ where: { id: user.MembershipId } });
      if (membership) {
        if (membership.discount == 0) return unitprice;
        const discount = unitprice * (membership.discount / 100);
        return (unitprice - discount);
      } else utils.createAndThrowError(404, 'Cannot find membership with provided id', 'MembershipNotFoundError');
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to calculate user discount', 'InternalUserCalculateDiscountError');
    }

  }
}

function removeWhiteSpaces(string) {
  /* Return a formatted value that replaces white-spaces using a regex, \s is for any white-spaces and \g is for global, meaning the entire string */
  let formatted = string.replace(/\s/g, '');
  return formatted;
}

module.exports = UserService;