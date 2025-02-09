const utils = require('../javascripts/utils.js');
const crypto = require('crypto');
const db = require('../models');
const UserService = require('./UserService.js');
const userService = new UserService(db);

const { QueryTypes } = require('sequelize');

class OrderService {
  constructor(db) {
    this.sequelize = db.sequelize;
    this.Order = db.Order;
    this.Order_Item = db.Order_Item;
    this.User = db.User;
    this.Cart = db.Cart;
    this.Membership = db.Membership;
    this.Product = db.Product;
    this.Status = db.Status;
  }
  async create(userId) {
    try {
      const user = await this.User.findOne({ where: { id: userId } });
      const memberships = await this.Membership.findAll();
      const cart = await this.Cart.findAll({ where: { UserId: userId }, include: [ { model: this.Product, attributes: [ 'unitprice' ] } ] });

      /* Use an object to pass by reference instead of by value to keep track on the current attempt  */
      let attemptHistory = { attempt: 0, maxAttempts: 10 };
      let totalPurchases = user.totalPurchases;

      if (cart.length > 0) {
        /* Generate a random ordernumber with a max attempts of 10 if it fails to generate a unique one in its initial attempt */
        const ordernumber = await this.generateOrderNumber(attemptHistory);
        const order = await this.Order.create({ UserId: userId, membershipid: user.MembershipId, StatusId: 1, ordernumber: ordernumber });

        /* If the user has items in the cart, create individual order_item records based on each cart record */
        if (user && cart.length > 0) {
          for (const item of cart) {
            totalPurchases += item.quantity;
            await this.Order_Item.create({ ordernumber: ordernumber, quantity: item.quantity, unitprice: item.unitprice, ProductId: item.ProductId, OrderId: order.id });
          }
          /* Update the user's total purchases */
          await userService.updateTotalPurchases(user.id, totalPurchases)

          /* Check for membership tier upgrade */
          const newMembershipId = await userService.trackMembership(totalPurchases, memberships);

          /* If a new membershipId is returned by the function above - update the user's membership id to the next tier */
          if (newMembershipId)
            await this.User.update({ MembershipId: newMembershipId }, { where: { id: user.id } });
        }

        await this.Cart.destroy({ where: { UserId: user.id } });
        return ordernumber;
      }
      else utils.createAndThrowError(400, 'Cannot process order - No items in cart', 'NoItemsInCartError');
      /* Empty the cart after 'checkout' */
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to create order', 'InternalOrderCreateError');
    }
  }
  async getAll() {
    try {
      const query = `
      SELECT
        Orders.id,
        Orders.ordernumber,
        Orders.UserId,
        Orders.MembershipId,
        Memberships.name AS membership,
        Statuses.id AS StatusId,
        Statuses.name as status,
        Orders.createdAt,
        Orders.updatedAt
        FROM Orders
      INNER JOIN Statuses ON Orders.StatusId = Statuses.id
      INNER JOIN Memberships ON Orders.MembershipId = Memberships.id
      ORDER BY Orders.id ASC
      `
      const orders = await this.sequelize.query(query, { type: QueryTypes.SELECT });
      return orders;
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to get orders by userId', 'InternalGetOrdersByUserIdError');
    }
  }
  async getAllByUserId(userId) {
    try {
      const query = `
      SELECT
        Orders.id,
        Orders.ordernumber,
        Orders.UserId,
        Orders.MembershipId,
        Memberships.name AS membership,
        Statuses.id AS StatusId,
        Statuses.name as status,
        Orders.createdAt,
        Orders.updatedAt
        FROM Orders
      INNER JOIN Statuses ON Orders.StatusId = Statuses.id
      INNER JOIN Memberships ON Orders.MembershipId = Memberships.id
      WHERE Orders.UserId = :userId
      ORDER BY Orders.id ASC
      `

      const orders = await this.sequelize.query(query, { type: QueryTypes.SELECT, replacements: { userId: userId } });
      return orders;
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to get orders for provided user id', 'InternalGetOrdersByUserIdError');
    }
  }
  async generateOrderNumber(attemptHistoryObj) {
    /* 
      Generate an order number and check if the generated order number already exists in the orders records and if it exists - 
      recursively call itself and regenerate a new order number with a max attempt to prevent infinite attempts

      Finally return the generated order number to the order record if an order with the current generated order number doesn't exist
    */
    const generatedOrderNumber = crypto.randomBytes(4).toString('hex');
    const orderExists = await this.Order.findOne({ where: { OrderNumber: generatedOrderNumber } });
    attemptHistoryObj.attempt++;

    if (attemptHistoryObj.attempt >= attemptHistoryObj.maxAttempts)
      utils.createAndThrowError(500, 'Failed to generate a unique order number for order', 'OrderNumberGenerateError');

    else if (orderExists && attemptHistoryObj.attempt < attemptHistoryObj.maxAttempts)
      await this.generateOrderNumber(attemptHistoryObj.attempt, attemptHistoryObj.maxAttempts);

    else return generatedOrderNumber;
  }
  async updateStatus(orderId, statusId) {
    try {
      const order = await this.Order.findOne({ where: { id: orderId } });
      const status = await this.Status.findOne({ where: { id: statusId } });

      if (!order) utils.createAndThrowError(404, 'Cannot find order with provided order id', 'OrderNotFoundError');
      if (!status) utils.createAndThrowError(404, 'Cannot find status with provided status id', 'StatusNotFoundError');

      await this.Order.update({ StatusId: statusId }, { where: { id: orderId } });
    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to update status of order', 'InternalUpdateOrderStatus');
    }
  }
  async getOrderDetails(ordernumber, user) {
    const isAdmin = user.role === 'Admin';
    try {
      const query = `
      SELECT
        Order_Items.id,
        Order_Items.ordernumber,
        Order_Items.OrderId,
        Orders.UserId,
        Orders.MembershipId,
        Memberships.name AS membership,
        Statuses.id AS StatusId,
        Statuses.name AS status,
        Products.name AS product,
        Products.id AS ProductId,
        Order_Items.quantity,
        Order_Items.unitprice,
        Memberships.discount AS discount,
        ROUND((Order_Items.unitprice * Order_Items.quantity), 2) AS totalprice
        FROM Order_Items
        INNER JOIN Orders ON Order_Items.OrderId = Orders.id
        INNER JOIN Products ON Order_Items.ProductId = Products.id
        INNER JOIN Memberships ON Orders.MembershipId = Memberships.id
        INNER JOIN Statuses ON Orders.StatusId = Statuses.id
      WHERE Order_Items.ordernumber = :ordernumber AND (:isAdmin = TRUE OR Orders.UserId = :userId)
      `
      const orderItems = await this.sequelize.query(query, { type: QueryTypes.SELECT, replacements: { ordernumber: ordernumber, isAdmin: isAdmin, userId: user.id } });
      if (orderItems.length > 0) return orderItems;
      else utils.createAndThrowError(404, 'Cannot find any order details with provided order number', 'OrderDetailsNotFoundError');

    } catch (error) {
      console.error(error);
      if (error.status) throw error;
      else utils.createAndThrowError(500, 'An internal server error has occurred while trying to get all order items', 'InternalGetAllOrderItemsError');
    }
  }
}


module.exports = OrderService;