const mysql = require('mysql2');
require ('dotenv').config();

const db = mysql.createConnection({
  host: "localhost",
  user: process.env.USER_DB,
  password: process.env.PASSWORD_DB,
  database: "employeeTracker_db",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL: " + err.stack);
    return;
  }

  console.log("Connected to MySQL as id " + db.threadId);
});

module.exports = db;