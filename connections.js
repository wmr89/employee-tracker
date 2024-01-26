const mysql = require('mysql2');
require ('dotenv').config();
// Create connection to the data base through mysql and use .env to secure passwords
const db = mysql.createConnection({
  host: "localhost",
  user: process.env.USER_DB,
  password: process.env.PASSWORD_DB,
  database: "employeeTracker_db",
});

// Connect to the data base through mysql
db.connect((err) => {
  if (err) {
    console.error(err);
    return;
  }
});

module.exports = db;