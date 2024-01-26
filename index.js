const inquirer = require('inquirer');
const mysql = require('mysql2');
require ('dotenv').config();
const table = require('console.table');

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

const ui = [
  {
    type: "list",
    message: "What do you want?",
    name: "response",
    choices: [
      "VIEW All DEPARTMENTS",
      "VIEW ALL ROLES",
      "VIEW ALL EMPLOYEES",
      "ADD A DEPARTMENT",
      "ADD A ROLE",
      "ADD AN EMPLOYEE",
      // 'UPDATE AN EMPLOYEE TITLE',
      // "UPDATE AN EMPLOYEE'S MANGER",
      // 'VIEW EMPLOYEES BY MANGER',
      // 'VIEW EMPLOYEES BY DEPARTMENT',
      // 'DELETE DEPARTMENT',
      // 'DELETE ROLE',
      // 'DELETE EMPLOYEE',
      // 'VIEW DEPARTMENT BUDGETS'
    ],
  },
];

const addDepartment = [
  {
    type: "input",
    message: "What is the name of the new department?",
    name: "department",
  },
];

const addRole = [
  {
    type: "input",
    message: "What is the name of the new role?",
    name: "role"
  },
  {
    type: "Number",
    message: "What is the salary of the new role?",
    name: "salary"
  },
  {
    type: "list",
    message: "What is the department for the new role?",
    choices: [
      `SELECT * FROM departments`
    ],
    name: "department"
  }
]

const departmentChoices = async() => {
  const departmentQuery = 'SELECT id AS value FROM department;';
  const departments = await db.query(departmentQuery); 
  return departments[0];
}






function init() {
  inquirer.prompt(ui).then((data) => {
    console.log(data.response);
    switch (data.response) {
      case "VIEW All DEPARTMENTS":
        console.log("Viewing all departments:");
        db.query("SELECT * FROM department", (error, results, fields) => {
          if (error) {
            console.error("Error querying departments: " + error.stack);
            return;
          }
          console.table(results);
        });
        break;
      case "VIEW ALL ROLES":
        console.log("Viewing all Roles:");
        db.query("SELECT * FROM role", (error, results) => {
          if (error) {
            console.error("Error querying roles: " + error.stack);
            return;
          }
          console.table(results);
        });
        break;
      case "VIEW ALL EMPLOYEES":
        console.log("Viewing all employees:");
        db.query("SELECT e.id AS employee_id, e.first_name, e.last_name, d.name AS department_name, CONCAT(m.first_name, ' ', m.last_name) AS manager_name, r.salary FROM employee e JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id;", (error, results) => {
          if (error) {
            console.error("Error querying roles: " + error.stack);
            return;
          }
          console.table(results);
        });
        break;
      case "ADD A DEPARTMENT":
        inquirer.prompt(addDepartment).then((data) => {
          console.log("Adding a department:");
          db.query("INSERT INTO department (name) VALUES (?)", [data.department], (error) => {
            if (error) {
              console.error("Error querying roles: " + error.stack);
              return;
            }
            console.log(`Created department ${data.department}`);
          });
        });
        break;

      case "ADD A ROLE":
        console.log("Adding a role:");
        db.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", (error, results) => {
          if (error) {
            console.error("Error querying roles: " + error.stack);
            return;
          }
          console.log(results);
        });
        break;
      case "ADD AN EMPLOYEE":
        console.log("Adding an employee");
        db.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", (error, results, fields) => {
          if (error) {
            console.error("Error querying roles: " + error.stack);
            return;
          }
          console.log(results);
        });
        break;
    }
  });
}

init();
