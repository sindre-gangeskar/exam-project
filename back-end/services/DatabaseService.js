const utils = require('../javascripts/utils');

class DatabaseService {
  constructor(db) {
    this.sequelize = db.sequelize;
    this.Product = db.Product;
    this.Brand = db.Brand;
    this.Category = db.Category;
    this.Membership = db.Membership;
    this.User = db.User;
    this.Status = db.Status;
    this.Role = db.Role;
  }
  async isPopulated() {
    try {
      const products = await this.Product.count();
      const brands = await this.Brand.count();
      const categories = await this.Category.count();
      const memberships = await this.Membership.count();
      const users = await this.User.count();
      const statuses = await this.Status.count();
      const roles = await this.Role.count();
      const checkArr = [ { name: 'Products', count: products }, { name: 'Brands', count: brands }, { name: 'Categories', count: categories }, { name: 'memberships', count: memberships }, { name: 'users', count: users }, { name: 'statuses', count: statuses }, { name: 'roles', count: roles } ];

      for (const table of checkArr) {
        if (table.count > 0) continue;
        else return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to check database population', 'DatabasePopulationError');
    }
  }
  async populate(categoryArr, brandsArr, productArr) {
    try {
      const productsCount = await this.Product.count();
      const brandsCount = await this.Brand.count();
      const categoriesCount = await this.Category.count();
      const membershipsCount = await this.Membership.count();
      const usersCount = await this.User.count();
      const statusesCount = await this.Status.count();
      const rolesCount = await this.Role.count();

      /* Categories */
      for (const category of categoryArr) {
        if (categoriesCount > 0) break;
        await this.Category.create({ name: category.name })
      }

      /* Brands */
      for (const brand of brandsArr) {
        if (brandsCount > 0) break;
        await this.Brand.create({ name: brand.name });
      }

      /* Statuses */
      const statusesNames = [ 'In Progress', 'Ordered', 'Completed' ];
      for (const status of statusesNames) {
        if (statusesCount > 0) break;
        await this.Status.create({ name: status });
      }

      /* Products */
      for (const product of productArr) {
        if (productsCount > 0) break;

        const brand = await this.Brand.findOne({ where: { name: product.brand } });
        const category = await this.Category.findOne({ where: { name: product.category } });

        if (brand && category)
          await this.Product.create({
            name: product.name,
            description: product.description,
            unitprice: product.price,
            quantity: product.quantity,
            imgurl: product.imgurl,
            isdeleted: 0,
            date_added: product.date_added,
            CategoryId: category.dataValues.id,
            BrandId: brand.dataValues.id,
          });

        else {
          console.log('No brand or category exists for product', product);
          continue;
        }
      }

      /* Memberships */
      const memberships = [ { name: 'Bronze' }, { name: 'Silver', minrequirement: 15, maxrequirement: 30, discount: 15 }, { name: 'Gold', minrequirement: 30, maxrequirement: null, discount: 30 } ]
      for (const membership of memberships) {
        if (membershipsCount > 0) break;
        await this.Membership.create(membership);
      }

      /* Roles */
      const roles = [ 'Admin', 'User' ];
      for (const role of roles) {
        if (rolesCount > 0) break;
        await this.Role.create({ name: role });
      }

      /* Users */
      const { hashedPassword, salt } = utils.hashPassword('P@ssword2023');
      const role = await this.Role.findOne({ where: { name: 'Admin' } });
      if (usersCount > 0) return;
      else await this.User.create({ username: 'Admin', password: hashedPassword, salt: salt, email: 'admin@noroff.no', firstname: 'Admin', lastname: 'Support', address: 'Online', phone: 911, MembershipId: 1, RoleId: role.dataValues.id });
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to populate database', 'DatabasePopulationError');
    }
  }
}

module.exports = DatabaseService;