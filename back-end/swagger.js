const autogen = require('swagger-autogen')();

const userAuthMessages = [ 'Login required', 'Invalid token, please log in again', 'Session has expired, please log in again' ]
const adminAuthMessages = [ 'Login required', 'Admin privileges required', 'Invalid token, please log in again', 'Session has expired, please log in again' ]
const unauthorizedErrors = [ 'InvalidJWTError', 'InvalidCredentialsError', 'UnauthorizedError', 'TokenExpiredError' ]

const invalidUserVariableErrors = [ 'InvalidStringError', 'InvalidEmailError', 'InvalidPhoneError' ]
const invalidProductVariableErrors = [ 'InvalidStringError', 'InvalidNumberError' ]

const doc = {
  info: {
    title: 'Exam Backend API',
    description: "API documentation for Sindre Gangeskar's Exam Project"
  },
  definitions: {
    initDBSuccess: {
      status: 'success',
      data: {
        statusCode: 201,
        result: 'Successfully populated database',
      }
    },
    initDBPopulated: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Database is already populated with initial data'
      }
    },
    initDBInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to populate database'
      }
    },
    unauthorized: {
      status: 'fail',
      data: {
        statusCode: 401,
        result: userAuthMessages,
        error: unauthorizedErrors
      }
    },
    adminUnauthorized: {
      status: 'fail',
      data: {
        statusCode: 401,
        result: adminAuthMessages,
        error: unauthorizedErrors
      }
    },
    authGetRoleCheckSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Role check successful',
        role: [ 'Admin', 'User' ]
      }
    },
    authGetRoleInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: [ 'An internal server error has occurred while trying to get token', 'An internal server error has occurred while trying to read token payload' ],
        error: [ 'JWTGetError', 'JWTReadError' ]
      }
    },
    usersGetSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: [ 'Successfully found users', 'No users found' ],
        users: [ {
          id: 1,
          username: 'user',
          firstname: 'John',
          lastname: 'Doe',
          email: 'johndoe@email.com',
          address: 'Example Address',
          phone: '123456789',
          totalPurchases: 2,
          createdAt: '2024-11-05T13:53:25.000Z',
          updatedAt: '2024-11-05T13:53:25.000Z',
          RoleId: 2,
          role: 'User',
          MembershipId: 1,
          membership: 'Bronze'
        } ]
      }
    },
    usersGetInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        message: 'An internal server error has occurred while trying to get all users',
      }
    },
    authPostSignupSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully created user',
      }
    },
    authPostSignupConflict: {
      status: 'fail',
      data: {
        statusCode: 409,
        result: 'A user with provided email or username already exists',
        error: 'DuplicateRecordError'
      }
    },
    authPostSignupUserError: {
      status: 'fail',
      data: {
        statusCode: 400,
        result: [
          'Required properties are missing',
          'Please remove invalid properties',
          'username must be a non-empty string',
          'firstname must be a non-empty string',
          'lastname must be a non-empty string',
          'address must be a non-empty string',
          'phone must be a non-empty string with numbers only (spaces allowed)',
          'email must be a non-empty string which follows the correct email format, e.g example@email.com' ],
        error: [ 'InvalidPropertyError', 'MissingPropertyError', ...invalidUserVariableErrors ]
      },
      missingInBody: [ 'phone', 'lastname' ],
      invalidProperties: [ 'InvalidPropertyExample1', 'InvalidPropertyExample2' ]
    },
    authPostSignupInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        message: 'An internal server error has occurred while trying to create user',
        error: 'UserPostInternalServerError'
      }
    },
    authPostLoginSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully logged in', token: '<jwt>', user: { id: 1, name: 'john smith', role: 'user', email: 'johnsmith@email.com' },
      }
    },
    authPostLoginUserError: {
      status: 'fail',
      data: {
        statusCode: 401,
        result: [
          'Required properties are missing',
          'username or email is required and must be a non-empty string',
          'password is required and must be a non-empty string',
          'Invalid credentials, please try again' ],
        error: [ 'InvalidCredentialsError', 'MissingCredentialsError', 'InvalidStringError' ],
        missingInBody: [ 'username', 'password', 'email' ],
        invalidProperties: [ 'ExampleInvalidProperty1', 'ExampleInvalidProperty2' ]
      }
    },
    authPostLoginNotFound: {
      status: 'fail',
      data: {
        statusCode: 404,
        result: 'No user with provided email or username exists',
        error: 'UserNotFoundError'
      }
    },
    authPostLoginInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        message: 'An internal server error has occurred while trying to find user data'
      }
    },
    userGetByIdSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully found user',
        user: {
          id: 1,
          username: 'johnSmith',
          firstname: 'John',
          lastname: 'Smith',
          email: 'johnsmith@email.com',
          address: 'Example Address',
          phone: '123456789',
          totalPurchases: 3,
          createdAt: '2024-12-05T13:20:59.000Z',
          updatedAt: '2024-12-05T13:20:59.000Z',
          RoleId: 2,
          role: 'User',
          MembershipId: 1,
          membership: 'Bronze'
        }
      }
    },
    userGetByIdNotFound: {
      status: 'fail',
      data: {
        statusCode: 404,
        result: 'No user with provided id exists',
        error: 'UserNotFoundError'
      }
    },
    userGetByIdInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to get user with provided id'
      }
    },
    userUpdateByIdSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully updated user'
      }
    },
    userUpdateByIdUserError: {
      status: 'fail',
      data: {
        statusCode: 400,
        result: [
          'Please remove invalid properties',
          'At least one property must be present',
          'firstname must be a non-empty string',
          'lastname must be a non-empty string',
          'address must be a non-empty string',
          'phone must be a non-empty string with numbers only (spaces allowed)',
          'email must be a non-empty string which follows the correct email format, e.g example@email.com',
          'RoleId must be a number'
        ],
        error: [ 'InvalidPropertyError', 'BodyEmptyUserError', ...invalidUserVariableErrors ],
        validProperties: [ 'RoleId', 'firstname', 'lastname', 'email', 'phone' ],
        invalidProperties: [ 'InvalidPropertyExample1, InvalidPropertyExample2' ]
      }
    },
    userUpdateByIdConflict: {
      status: 'fail',
      data: {
        statusCode: 409,
        result: 'Cannot update user - The email provided is already in use by another user',
        error: 'DuplicateRecordError',
      }
    },
    userUpdateByIdNotFound: {
      status: 'fail',
      data: {
        statusCode: 404,
        result: [
          'No user with provided id exists',
          'No role with provided id exists' ],
        error: [ 'UserNotFoundError', 'RoleNotFoundError' ]
      }
    },
    userUpdateByIdInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        message: 'An internal server error has occurred while trying to update user data'
      }
    },
    brandsGetSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: [ 'Successfully found brands', 'No brands found' ],
        brands: [ {
          id: 1,
          name: 'Apple'
        } ]
      }
    },
    brandsGetInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        message: 'An internal server error has occurred while trying to get all brands'
      }
    },
    brandsDeleteSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully deleted brand'
      }
    },
    brandsDeleteNotFound: {
      status: 'fail',
      data: {
        statusCode: 404,
        result: 'Cannot find brand with provided id',
        error: 'BrandNotFoundError'
      }
    },
    brandsDeleteConflict: {
      status: 'fail',
      data: {
        statusCode: 409,
        result: 'Cannot delete brand - A product is using this brand',
        error: 'BrandDeleteError'
      }
    },
    brandsDeleteInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        message: 'An internal server error has occurred while trying to delete brand'
      }
    },
    brandsPostSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully created brand'
      }
    },
    brandsPostUserError: {
      status: 'fail',
      data: {
        statusCode: 400,
        result: [
          'Required properties are missing',
          'Please remove invalid properties',
          'name must be a non-empty string' ],
        error: [ 'MissingPropertyError', 'InvalidPropertyError', 'InvalidStringError' ],
        missingInBody: [ 'name' ],
        invalidProperties: [ 'ExampleInvalidProperty1', 'ExampleInvalidProperty2' ]
      }
    },
    brandsPostInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        message: 'An internal server error has occurred while trying to create brand'
      }
    },
    brandsPostConflict: {
      status: 'fail',
      data: {
        statusCode: 409,
        result: 'Brand with provided name already exists',
        error: 'DuplicateRecordError'
      }
    },
    brandsUpdateSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully updated brand'
      }
    },
    brandsUpdateUserError: {
      status: 'fail',
      data: {
        statusCode: 400,
        result: [
          'Please remove invalid properties',
          'At least one property must be present',
          'name must be a non-empty string' ],
        error: [ 'InvalidPropertyError', 'BodyEmptyUserError', 'InvalidStringError' ],
        validProperties: [ 'name' ],
        invalidProperties: [ 'InvalidPropertyExample1', 'InvalidPropertyExample2' ]
      }
    },
    brandsUpdateConflict: {
      status: 'fail',
      data: {
        statusCode: 409,
        result: 'Cannot update brand - another brand with the same name already exists',
        error: 'DuplicateRecordError'
      }
    },
    brandsUpdateInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to update brand'
      }
    },
    cartPostSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully added product to cart'
      }
    },
    cartPostNotFound: {
      status: 'fail',
      data: {
        statusCode: 404,
        result: [ 'Cannot add product to cart - Product with provided ProductId does not exist' ],
        error: 'CartProductNotFoundError'
      }
    },
    cartPostInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to add product to cart'
      }
    },
    cartPostUserError: {
      status: 'fail',
      data: {
        statusCode: 400,
        result: [
          'Required properties are missing',
          'Please remove invalid properties',
          'ProductId must be a number',
          'Cannot add product to cart - product is no longer available'
        ],
        error: [ 'InvalidPropertyError', 'CartProductUnavailableError', 'InvalidNumberError' ],
        missingInBody: [ 'ProductId' ],
        invalidProperties: [ 'InvalidPropertyExample1', 'InvalidPropertyExample2' ]
      }
    },
    cartCheckoutSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully purchased items',
        ordernumber: "abc123ef"
      }
    },
    cartCheckoutUserError: {
      status: 'fail',
      data: {
        statusCode: 400,
        result: 'Cannot process order - No items in cart',
        error: 'NoItemsInCartError'
      }
    },
    cartCheckoutInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to create order'
      }
    },
    cartGetSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: [ 'Successfully found cart item(s)', 'Cart is empty' ],
        cart: [ {
          id: 1,
          product: "Mac Pro Quad-Core and Dual Core GPU",
          ProductId: 8,
          imgurl: "http://images.restapi.co.za/products/product-mac-pro.png",
          quantity: 2,
          unitprice: 2999,
          totalPrice: 5998,
          membership: "Bronze",
          MembershipId: 1,
          discount: 0,
          createdAt: "2024-11-06T21:40:39.000Z",
          updatedAt: "2024-11-06T21:40:50.000Z"
        } ]
      }
    },
    cartGetInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to get all cart records'
      }
    },
    cartGetNotFound: {
      status: 'fail',
      data: {
        statusCode: 404,
        result: 'Cart is empty',
        error: 'CartNotFoundError'
      }
    },
    cartDeleteSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully deleted item from cart'
      }
    },
    cartDeleteNotFound: {
      status: 'fail',
      data: {
        statuaCode: 404,
        result: 'No item with provided cart id exists',
        error: 'CartItemNotFoundError'
      }
    },
    cartDeleteInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to delete an item from the cart'
      }
    },
    cartUpdateSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully updated item in cart'
      }
    },
    cartUpdateNotFound: {
      status: 'fail',
      data: {
        statusCode: 404,
        result: 'Cannot update cart - Cannot find cart item with provided id',
        error: 'CartItemNotFoundError'
      }
    },
    cartUpdateUserError: {
      status: 'fail',
      data: {
        statusCode: 400,
        result: [
          'At least one property must be present in the body',
          'Please remove invalid properties',
          'Cannot set total quantity - totalQuantity must be 1 or higher',
          'Cannot add to cart - add must be 1 or higher',
          'Cannot add to cart - Specified amount to add exceeds the available product quantity',
          'Cannot remove from cart - remove must be 1 or higher',
          'Cannot remove any more from cart - At least 1 in quantity is required in cart. Consider deleting the cart if you want to remove all',
          'Only one property can be used at a time - add, remove or totalQuantity',
          'totalQuantity must be a number',
          'add must be a number',
          'remove must be a number' ],
        error: [ 'CartUpdateRemoveError', 'CartUpdateError', 'CartUpdateAddError', 'CartUpdateTotalQuantityError', 'InvalidNumberError' ],
        validProperties: [ 'totalQuantity', 'add', 'remove' ],
        invalidProperties: [ 'InvalidPropertyExample1', 'InvalidPropertyExample2' ]
      }
    },
    cartUpdateInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to update cart item'
      }
    },
    membershipsGetSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: [ 'Successfully found memberships', 'No memberships found' ],
        memberships: [
          {
            name: 'Bronze',
            minrequirement: 0,
            maxrequirement: 15,
            discount: 0
          }
        ]
      }
    },
    membershipsGetInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to get memberships'
      }
    },
    ordersGetSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: [ 'Successfully found orders', 'No orders registered' ],
        orders: [ {
          id: 1,
          ordernumber: "293374f8",
          UserId: 2,
          quantity: 2,
          status: "In Progress",
          MembershipId: 1,
          membership: "Bronze",
          discount: 0,
          createdAt: "2024-11-07T13:09:25.000Z",
          updatedAt: "2024-11-07T13:09:25.000Z"
        } ]
      }
    },
    ordersGetUserInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        message: 'An internal server error has occurred while trying to get orders for provided user id',
      }
    },
    ordersGetInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to get orders'
      }
    },
    ordersGetNotFound: {
      status: 'fail',
      data: {
        statusCode: 404,
        result: 'No orders found',
        error: 'OrdersNotFoundError'
      }
    },
    ordersGetByOrderNumberSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully found order details',
        order: [ {
          id: 2,
          ordernumber: '6592238e',
          OrderId: 1,
          UserId: 2,
          MembershipId: 1,
          membership: 'Bronze',
          StatusId: 1,
          status: 'In Progress',
          product: 'Apple TV 2016',
          ProductId: 2,
          quantity: 1,
          unitprice: 599,
          discount: 0,
          totalprice: 599
        } ]
      }
    },
    ordersGetByOrderNumberNotFound: {
      status: 'fail',
      data: {
        statusCode: 404,
        result: 'Cannot find any order details with provided order number',
        error: 'OrderDetailsNotFoundError'
      }
    },
    ordersGetByOrderNumberInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        message: 'An internal server error has occurred while trying to get an order by order number'
      }
    },
    ordersOrderUpdateSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully updated status of order'
      }
    },
    ordersOrderUpdateNotFound: {
      status: 'fail',
      data: {
        statusCode: 404,
        result: [ 'Cannot find order with provided order id', 'Cannot find status with provided status id' ],
        error: [ 'OrderNotFoundError', 'StatusNotFoundError' ]
      }
    },
    ordersOrderUpdateInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to update status of order'
      }
    },
    ordersOrderUpdateUserError: {
      status: 'fail',
      data: {
        statusCode: 400,
        result: [
          'Please remove invalid properties',
          'At least one property must be present',
          'StatusId must be a number'
        ],
        error: [ 'InvalidPropertyError', 'BodyEmptyUserError' ],
        validProperties: [ 'StatusId' ],
        invalidProperties: [ 'InvalidPropertyExample1', 'InvalidPropertyExample2', 'InvalidNumberError' ]
      }
    },
    categoriesGetSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully found categories',
        categories: [ {
          id: 1,
          name: 'Phones'
        } ]
      }
    },
    categoriesGetInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        message: 'An internal server error has occurred while trying to get categories'
      }
    },
    categoriesPostSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully created category'
      }
    },
    categoriesPostUserError: {
      status: 'fail',
      data: {
        statusCode: 400,
        result: [
          'Required properties are missing',
          'Please remove invalid properties',
          'name must be a non-empty string' ],
        error: [ 'InvalidPropertyError', 'MissingPropertyError', 'InvalidStringError' ],
        missingInBody: [ 'name' ],
        invalidProperties: [ 'InvalidPropertyExample1', 'InvalidPropertyExample2' ]
      }
    },
    categoriesPostInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to create category'
      }
    },
    categoriesPostConflict: {
      status: 'fail',
      data: {
        statusCode: 409,
        result: 'Cannot create category - A category with provided category name already exists',
        error: 'DuplicateRecordError'
      }
    },
    categoriesDeleteSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully deleted category'
      }
    },
    categoriesDeleteNotFound: {
      status: 'fail',
      data: {
        statusCode: 404,
        result: 'Cannot delete category - Cannot find category with provided id',
        error: 'CategoryNotFoundError'
      }
    },
    categoriesDeleteInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to delete category'
      }
    },
    categoriesDeleteConflict: {
      status: 'fail',
      data: {
        statusCode: 409,
        result: 'Cannot delete category - A product is using this category',
        error: 'CategoryDependencyError'
      }
    },
    categoriesUpdateSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully updated category'
      }
    },
    categoriesUpdateNotFound: {
      status: 'fail',
      data: {
        statusCode: 404,
        result: 'Cannot update category - Category with provided id does not exist',
        error: 'CategoryNotFoundError'
      }
    },
    categoriesUpdateUserError: {
      status: 'fail',
      data: {
        statusCode: 400,
        result: [
          'Please remove invalid properties',
          'At least one property must be present',
          'name must be a non-empty string' ],
        error: [ 'InvalidPropertyError', 'BodyEmptyUserError', 'InvalidStringError' ],
        validProperties: [ 'name' ],
        invalidProperties: [ 'InvalidPropertyExample1', 'InvalidPropertyExample2' ]
      }
    },
    categoriesUpdateInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to update category'
      }
    },
    productsGetSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: [ 'Successfully found products', 'No products found' ],
        products: [ {
          id: 2,
          name: "Apple TV 2016",
          description: "The future of television is here.",
          quantity: 21,
          unitprice: 599,
          isdeleted: 0,
          imgurl: "http://images.restapi.co.za/products/product-apple-tv.png",
          date_added: "2020-05-30T22:00:00.000Z",
          createdAt: "2024-12-04T10:03:40.000Z",
          updatedAt: "2024-12-04T10:03:40.000Z",
          BrandId: 1,
          CategoryId: 2,
          brand: "Apple",
          category: "TVs"
        } ]
      }
    },
    productsGetInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to get products'
      }
    },
    productsPostSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully created product'
      }
    },
    productsPostNotFound: {
      status: 'fail',
      data: {
        statusCode: 404,
        result: [ 'No brand with provided id exists', 'No category with provided id exists' ],
        error: [ 'BrandNotFoundError', 'CategoryNotFoundError' ]
      }
    },
    productsPostInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to create a product'
      }
    },
    productsPostConflict: {
      status: 'fail',
      data: {
        statusCode: 409,
        result: 'Cannot create product - A product with the same name already exists',
        error: 'DuplicateRecordError'
      }
    },
    productsPostUserError: {
      status: 'fail',
      data: {
        statusCode: 400,
        result: [
          'Required properties are missing',
          'Please remove invalid properties',
          'name must be a non-empty string',
          'description must be a non-empty string',
          'imgurl must be a string',
          'BrandId must be a number',
          'CategoryId must be a number',
          'quantity must be a number',
          'unitprice must be a number',
        ],
        error: [ 'InvalidPropertyError', 'MissingPropertyError', ...invalidProductVariableErrors ],
        missingInBody: [ 'name', 'description', 'quantity' ],
        invalidProperties: [ 'InvalidPropertyExample1', 'InvalidPropertyExample2' ]
      }
    },
    productsSearchSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: [ 'Successfully found products', 'No products found' ],
        products: [ {
          id: 2,
          name: "Apple TV 2016",
          description: "The future of television is here.",
          quantity: 21,
          unitprice: 599,
          isdeleted: 0,
          imgurl: "http://images.restapi.co.za/products/product-apple-tv.png",
          date_added: "2020-05-30T22:00:00.000Z",
          createdAt: "2024-12-04T10:03:40.000Z",
          updatedAt: "2024-12-04T10:03:40.000Z",
          BrandId: 1,
          CategoryId: 2,
          brand: "Apple",
          category: "TVs"
        } ],
        recordsFound: 1
      }
    },
    productsSearchUserError: {
      status: 'fail',
      data: {
        statusCode: 400,
        result: [ 'search must be a non-empty string', 'Required properties are missing', 'Please remove invalid properties' ],
        error: [ 'InvalidStringError', 'MissingPropertyError', 'InvalidPropertyError' ],
        missingInBody: [ 'search' ],
        invalidProperties: [ 'InvalidPropertyExample1', 'InvalidPropertyExample2' ]
      }
    },
    productsSearchInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to search for product(s)'
      }
    },
    productsGetDeletedSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: [ 'Successfully found deleted products', 'No deleted products found' ],
        products: [ {
          id: 2,
          name: "Apple TV 2016",
          description: "The future of television is here.",
          quantity: 21,
          unitprice: 599,
          isdeleted: 1,
          imgurl: "http://images.restapi.co.za/products/product-apple-tv.png",
          date_added: "2020-05-30T22:00:00.000Z",
          createdAt: "2024-12-04T10:03:40.000Z",
          cpdatedAt: "2024-12-04T10:03:40.000Z",
          BrandId: 1,
          CategoryId: 2,
          brand: "Apple",
          category: "TVs"
        }
        ]
      }
    },
    productsGetDeletedInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'an internal server error has occurred while trying to get deleted products'
      }
    },
    productsGetAllSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: [ 'Successfully found products', 'No products found' ],
        products: [ {
          id: 2,
          product: "Apple TV 2016",
          description: "The future of television is here.",
          quantity: 21,
          unitprice: 599,
          isdeleted: 0,
          imgurl: "http://images.restapi.co.za/products/product-apple-tv.png",
          date_added: "2020-05-30T22:00:00.000Z",
          createdAt: "2024-12-04T10:03:40.000Z",
          updatedAt: "2024-12-04T10:03:40.000Z",
          BrandId: 1,
          CategoryId: 2,
          brand: "Apple",
          category: "TVs"
        } ]

      }
    },
    productsGetAllInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to get all products'
      }
    },
    productsUpdateSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully updated product'
      }
    },
    productsUpdateUserError: {
      status: 'fail',
      data: {
        statusCode: 400,
        result: [
          'Please remove invalid properties',
          'At least one property must be present',
          'name must be a non-empty string',
          'description must be a non-empty string',
          'imgurl must be a string',
          'BrandId must be a number',
          'CategoryId must be a number',
          'quantity must be a number',
          'unitprice must be a number',
          'Cannot set quantity to below 0',
          'Cannot set unitprice to below 0'

        ],
        error: [ 'InvalidPropertyError', 'BodyEmptyUserError', ...invalidProductVariableErrors, 'StockOutOfRangeError', 'UnitPriceOutOfRangeError' ],
        validProperties: [ 'name', 'description', 'imgurl', 'BrandId', 'CategoryId', 'quantity', 'unitprice' ],
        invalidProperties: [ 'InvalidPropertyExample1', 'InvalidPropertyExample2' ]
      }
    },
    productsUpdateConflict: {
      status: 'fail',
      data: {
        statusCode: 409,
        result: 'Cannot update product - A product with the provided name already exists',
        error: 'DuplicateRecordError'
      }
    },
    productsUpdateInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to update product'
      }
    },
    productsUpdateNotFound: {
      status: 'fail',
      data: {
        statusCode: 404,
        result: [ 'Cannot update product - No product with provided id exists', 'Cannot update product - No brand with provided id exists', 'Cannot update product - No category with provided id exists' ],
        error: [ 'ProductNotFoundError', 'BrandNotFoundError', 'CategoryNotFoundError' ]
      }
    },
    productsDeleteSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: 'Successfully deleted product'
      }
    },
    productsDeleteNotFound: {
      status: 'fail',
      data: {
        statusCode: 404,
        result: 'Cannot delete product - no product was found with provided id',
        error: 'ProductNotFoundError'
      }
    },
    productsDeleteInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        message: 'An internal server error has occurred while trying to delete product'
      }
    },
    rolesGetSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: [ 'Successfully found roles', 'No roles found' ],
        roles: [ { id: 1, role: 'Admin', }, { id: 2, role: 'User' } ]
      }
    },
    rolesGetInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        result: 'An internal server error has occurred while trying to get all roles'
      }
    },
    statusesGetSuccess: {
      status: 'success',
      data: {
        statusCode: 200,
        result: [ 'Successfully found statuses', 'No statuses found' ],
        statuses: [ { id: 1, Status: 'In Progress' } ]
      }
    },
    statusesGetInternalError: {
      status: 'error',
      data: {
        statusCode: 500,
        message: 'An internal server error has occurred while trying to get all statuses'
      }
    }
  },
  securityDefinitions: {
    adminAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Include **Bearer** prefix in the value field with token - e.g **Bearer abc123**'
    },
    userAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Include **Bearer** prefix in the value field with token - e.g **Bearer abc123**'
    }
  },
  host: 'localhost:3000'
}

const outputFile = './swagger-output.json';
const routes = [ './app.js' ];

autogen(outputFile, routes, doc).then(() => {
  require('./bin/www');
});
