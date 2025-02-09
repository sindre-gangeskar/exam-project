![Noroff](http://images.restapi.co.za/pvt/Noroff-64.png)

# Noroff - Back-end Development Year 1

## Exam Project CA - Sindre Gangeskar (Front-end)

## Requirements

**Node.js** version used: `v20.15.0`

Node.js is **required** for this project.
You can acquire Node.js by clicking [here](https://nodejs.org)

# Installation

### Front-end Application Setup

Open your favorite IDE of choice and navigate to the project's **front-end** folder.  
Create a **.env** file inside and paste the environment variables underneath into it and hit save.

In the terminal - make sure the location is set to the root of the **front-end** folder.
If you are not at the front-end's root, use `cd "./front-end"` as a command in the terminal to navigate to the relative location from the project's root to the front-end's.

1. Install dependencies `npm install`
2. Start the server `npm start`

### Environment Variables

```
PORT=3001
BACKEND_HOST=http://localhost:3000
SESSION_SECRET=<generated_token>
```

### Application Usage

The application should successfully boot and be ready.  
The admin dashboard login screen can be visited at http://localhost:3001/

Populating the database from the login screen on Admin Dashboard which is the root endpoint for the application can be done by clicking the 'Populate Database' button for ease of use.  
It will make a request to the back-end API to initialize the database - essentially the same as posting to the back-end's /init endpoint with a **POST** request.

### All dependencies used

```
├── bootstrap-icons@1.11.3
├── bootstrap@5.3.3
├── connect-sqlite3@0.9.15
├── cookie-parser@1.4.7
├── debug@2.6.9
├── dotenv@16.4.5
├── ejs@3.1.10
├── express-session@1.18.1
├── express@4.21.1
├── front-end@0.0.0 -> .\
├── http-errors@1.6.3
├── install@0.13.0
├── jsend@1.1.0
└── morgan@1.9.1
```
