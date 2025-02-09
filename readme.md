![Noroff](http://images.restapi.co.za/pvt/Noroff-64.png)

# Noroff - Back-end Development Year 1 Exam Course Assignment (Sindre Gangeskar)

This is my exam project which revolved around simulating an e-commerce application with proper handling of carts, product quantity and restrictions to stock. 
- All users are allowed to browse and search available products (except soft-deleted products)
- All users can search by brand, name and category
- Authentication is done via JWTs (JSON Web Token) with Bearer in the authorization header for making API requests. 
- All customer-based actions are done via making API requests through Postman or equivalent. 
- An admin user can update a product or soft-delete. 
- A logged in user is allowed to add items to the cart and perform a checkout.
- The project will reject a checkout if the available stock is lower than what the user inputs as their desired quantity.
- The project calculates the discount of the user's current membership tier (Bronze 0%, Silver 15%, Gold 30%). 
- The user's membership tier is updated based on the quantity the user has purchased,  and the updated tier's discount will be taken into account the next time the user makes a purchase. 
- An ordernumber is generated upon a successful checkout which is a hashed 8-char long string. 
- Only admins are able to view orders that are not their own.
- A user can fetch the details of an ordernumber only if the order belongs to the user. 
- Stock is recalculated and reserved whenever a user adds, updates (quantity changes) or removes an item from the cart. 

The front-end has an admin dashboard which you can access via http://localhost:3001.

### EP - Course Assignment
If you want to test the application, follow the readme instructions.

- [back-end folder for back-end code (back-end)](./back-end)
- [front-end folder for front-end code (front-end)](./front-end)

---

# Project Setup

## Using git

Create an empty folder for the project and open your terminal with the project's root directory as its location.
Type or copy the command underneath into the terminal and hit enter. It should successfully clone the repository into the folder.

`git clone https://github.com/sindre-gangeskar/exam-project.git .`

## Manually downloading the project

Visit the [repo](https://github.com/sindre-gangeskar/exam-project).

In the top right corner of the repo, click the **Code** dropdown and select **'Download Zip'**.  
Extracts its contents into an empty folder of your choice.

## Setting up back-end and front-end

1. For the back-end setup, please see back-end's [readme.md](./back-end/readme.md)
2. For the front-end setup, please see front-end's [readme.md](./front-end/readme.md)

## Node.js version used

`v20.15.0`

## References

- [Regex101](https://regex101.com)
- [StackOverflow](https://stackoverflow.com)
- [JSONWebToken](https://www.npmjs.com/package/jsonwebtoken)
- [ChatGPT](https://chatgpt.com/)
- [Sequelize](https://sequelize.org/)
- [MDN](https://developer.mozilla.org/en-US/)
- [Swagger Autogen](https://swagger-autogen.github.io/docs/)
- [MySQL Dev](https://dev.mysql.com/doc/)
- [Supertest](https://github.com/ladjs/supertest)
- [Jest](https://jestjs.io/docs/getting-started)
- [Pixabay](https://pixabay.com/photos/mountains-dawn-forest-fog-twilight-7452929/) - Background image in the login screen on front-end
