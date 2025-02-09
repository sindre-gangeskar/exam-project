const utils = require('../javascripts/utils.js');
const db = require('../models');
const UserService = require('./UserService.js');
const userService = new UserService(db);
const { QueryTypes } = require('sequelize');
class CartService {
  constructor(db) {
    this.sequelize = db.sequelize;
    this.Cart = db.Cart;
    this.Product = db.Product;
    this.User = db.User;
  }
  async getAll(userId) {
    try {
      const query = `
      SELECT
        Carts.id,
        Products.name AS product,
        Products.id AS ProductId,
        Products.imgurl AS imgurl,
        Carts.quantity,
        Carts.unitprice,
        ROUND((Carts.unitprice * Carts.quantity), 2) AS totalprice,
        Memberships.name AS membership,
        UserData.MembershipId AS MembershipId,
        Memberships.discount AS discount,
        Carts.createdAt,
        Carts.updatedAt
      FROM Carts
      INNER JOIN Products ON Carts.ProductId = Products.id
      INNER JOIN (SELECT id, MembershipId FROM Users WHERE id = :userId) As UserData ON Carts.UserId = UserData.id
      INNER JOIN Memberships ON UserData.MembershipId = Memberships.id
      WHERE Carts.UserId = :userId
      `
      const carts = await this.sequelize.query(query, { type: QueryTypes.SELECT, replacements: { userId: userId } });
      return carts;
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to get all cart records', 'InternalCartGetAllError');
    }

  }
  async create(productId, userId) {
    try {
      const user = await this.User.findOne({ where: { id: userId } });
      if (!user) return utils.createAndThrowError(404, 'Cannot create cart - user with provided user id could not be found', 'UserNotFoundError');

      const product = await this.Product.findOne({ where: { id: productId } });
      if (!product) return utils.createAndThrowError(404, 'Cannot add product to cart - product with provided ProductId does not exist', 'CartProductNotFoundError');
      if (product.isdeleted == 1) return utils.createAndThrowError(401, 'Cannot add product to cart - product is no longer available', 'CartProductUnavailableError');
      
      const cart = await this.Cart.findOne({ where: { ProductId: productId, UserId: userId } });
      calculateStock(product.quantity, 1);
      const price = await userService.calculateDiscount(user, product.unitprice, cart ? cart.quantity : 1);
      /* If the user has no cart record of the same type, create one with quantity of 1 and subtract the product's quantity with -1 */
      if (!cart) {
        await this.Cart.create({ ProductId: productId, quantity: 1, UserId: userId, unitprice: price, totalprice: (price * 1) });
        await this.Product.update({ quantity: (product.quantity - 1) }, { where: { id: productId } })
      }
      /* If the user already has a product in the cart, add another +1 to the and subtract 1 from the product's quantity */
      else {
        const totalprice = cart.unitprice * (cart.quantity + 1);
        const productQuantity = product.quantity - 1;

        await this.Cart.update({ quantity: cart.quantity + 1, totalprice: totalprice }, { where: { ProductId: productId, UserId: userId } });
        await this.Product.update({ quantity: productQuantity }, { where: { id: productId } })
      }
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while tyring to add product to cart', 'InternalCartCreateError');
    }
  }
  async delete(cartId, userId) {
    try {
      const cart = await this.Cart.findOne({ where: { id: cartId, UserId: userId } });
      if (cart) {
        const product = await this.Product.findOne({ where: { id: cart.ProductId } });
        if (product) {
          await this.Product.update({ quantity: product.quantity + cart.quantity }, { where: { id: cart.ProductId } });
          await this.Cart.destroy({ where: { id: cartId, UserId: userId } });
        }
      }
      else utils.createAndThrowError(404, 'No item with provided cart id exists', 'CartItemNotFoundError');
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to delete an item from the cart', 'InternalDeleteFromCartError');
    }
  }
  async update(cartId, userId, body) {
    try {
      const { add, remove, totalQuantity: totalQuantity } = body;
      if (Object.entries(body).length > 1) utils.createAndThrowError(400, 'Only one property can be used at a time - add, remove or totalQuantity', 'CartUpdateError');
      const cart = await this.Cart.findOne({ where: { id: cartId, UserId: userId } });
      if (cart) {
        const product = await this.Product.findOne({ where: { id: cart.ProductId } });
        const totalProductQuantity = product.quantity + cart.quantity;

        /* If the user wants to remove an amount from cart */
        if (remove || typeof remove === 'number') {
          if (cart.quantity - remove <= 0)
            utils.createAndThrowError(400, 'Cannot remove any more from cart - At least 1 in quantity is required in cart. Consider deleting the cart if you want to remove all', 'CartUpdateRemoveError');

          calculateStock(totalProductQuantity, remove);
          if (remove <= 0) utils.createAndThrowError(400, 'Cannot remove from cart - Remove must be 1 or higher', 'CartUpdateRemoveError');
          await this.Cart.update({ quantity: cart.quantity - remove }, { where: { id: cartId, UserId: userId } });
          await this.Product.update({ quantity: product.quantity + remove }, { where: { id: cart.ProductId } });
        }
        /* If user wants to add an amount to cart - including typeof check to include falsy values such as 0*/
        else if (add || typeof add === 'number') {
          if (add > product.quantity)
            utils.createAndThrowError(400, `Cannot add to cart - Specified amount to add exceeds the available product quantity`, 'CartUpdateAddError');

          calculateStock(totalProductQuantity, add);
          if (add <= 0) utils.createAndThrowError(400, 'Cannot add to cart - Add must be 1 or higher', 'CartUpdateAddError');
          await this.Cart.update({ quantity: cart.quantity + add }, { where: { id: cartId, UserId: userId } });
          await this.Product.update({ quantity: product.quantity - add }, { where: { id: cart.ProductId } });
        }
        /* If the user wants to change the total quantity in the cart */
        else if (totalQuantity || typeof totalQuantity === 'number') {
          /*
          Check the difference between the cart's quantity and the new total quantity the user wants to assign, and check if it's positive or negative - 
          and then update the product's quantity with the difference

          Calculate the quantity before updating to make sure the user can add the desired quantity to the cart, the calculateStock function takes in
          the total quantity for the product between the cart's quantity and the product's quantity to use as a total to calculate from. 
          
          If cart quantity is greater than the total quantity in question and the product's quantity isn't zero - a cart quantity exceeds product's quantity error is thrown.
          Else if the product's quantity is less than or equal to zero, throw an out of stock error
          */
          const difference = totalQuantity - cart.quantity;
          const isPositive = (value) => { return Math.sign(value) >= 0 ? true : false; }
          const productQuantity = isPositive(difference) ? (product.quantity - Math.abs(difference)) : (product.quantity + Math.abs(difference));

          calculateStock(totalProductQuantity, totalQuantity);
          if (totalQuantity <= 0) utils.createAndThrowError(400, 'Cannot set total quantity - totalQuantity must be 1 or higher', 'CartUpdateTotalQuantityError');
          await this.Cart.update({ quantity: totalQuantity, totalprice: (cart.unitprice * totalQuantity) }, { where: { id: cartId, UserId: userId } });
          await this.Product.update({ quantity: productQuantity }, { where: { id: cart.ProductId } });
        }
      }
      else utils.createAndThrowError(404, 'Cannot update cart - Cannot find cart item with provided id', 'CartItemNotFoundError');
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to update cart item', 'InternalUpdateCartItemError');
    }
  }
}

function calculateStock(productQuantity, cartQuantity) {
  if (productQuantity <= 0) utils.createAndThrowError(400, 'Product is out of stock', 'ProductOutOfStockError');
  else if (cartQuantity > productQuantity)
    utils.createAndThrowError(400, 'Cannot add to cart - Desired quantity exceeds the available product quantity', 'QuantityExceedsStockError');
}

module.exports = CartService;