![Noroff](http://images.restapi.co.za/pvt/Noroff-64.png)

# Noroff - Back-end Development Year 1

## Exam Project CA - Sindre Gangeskar (Back-end)

## Requirements

**Node.js** version used: `v20.15.0`

Node.js is **required** for this project.
You can acquire Node.js by clicking [here](https://nodejs.org)

# Installation

### Database Setup

Open your favorite SQL server application of choice (MySQL Workbench, DBeaver or equivalent) and type the following commands in a new SQL script.
```
CREATE SCHEMA IF NOT EXISTS <db_name>;
CREATE USER IF NOT EXISTS '<db_name>'@'localhost' IDENTIFIED BY '<user_password>';
GRANT ALL ON ep_ca_db.* TO '<db_name>'@'localhost';
```
 
---

### Back-end Application Setup

Open your favorite IDE of choice and navigate to the project's **back-end** folder.  
Create a **.env** file inside and paste the environment variables underneath into it and hit save.  

In the terminal - make sure the location is set to the root of the **back-end** folder.
If you are not at the back-end's root, use `cd "./back-end"` as a command in the terminal to navigate to the relative location from the project's root to the back-end's.

Run these commands to install all dependencies and start the application.
1. Install dependencies `npm install`
2. Start the server `npm start`

### Environment Variables

```
DB_NAME=<db_name>
DB_PASSWORD=<db_password>
DB_USER=<db_username>
DB_DIALECT=mysql
DB_PORT=3306
HOST=localhost
PORT=3000
TOKEN_SECRET=<generated_token>
```

### Application Usage & Documentation

The server should successfully boot and be ready for any commands and making a **GET** request to the root endpoint of localhost:3000 should greet you with a message.  
Make sure the application is populated with the initial data by making a **POST** request to http://localhost:3000/init (Also included as documentation in the doc endpoint - see line below)  
All documentation can be found at (http://localhost:3000/doc)  

### Testing with Jest

Run automatic testing with command `npm test`  

Before running a test - it's **important** to note that the database must have all initial data set from '/init' endpoint, and no previous testing data inserted to successfully test the application. (Any previous testing data will make it fail)  
The reason why this is necessary is that it requires data from the database's initial data such as the admin user that comes with the population of the data in order to successfully perform the testing actions.  
Any previous testing data will persist after a test, which is why re-initializing the database is required to make sure the previous testing data isn't in the database upon testing.  

### All dependencies used

```
├── base-express@0.0.0 -> .\
├── cookie-parser@1.4.7
├── debug@2.6.9
├── dotenv@16.4.5
├── ejs@3.1.10
├── express@4.21.2
├── http-errors@1.6.3
├── jest@29.7.0
├── jsend@1.1.0
├── jsonwebtoken@9.0.2
├── morgan@1.9.1
├── mysql@2.18.1
├── mysql2@3.11.3
├── sequelize@6.37.4
├── supertest@7.0.0
├── swagger-autogen@2.23.7
└── swagger-ui-express@5.0.1
```
