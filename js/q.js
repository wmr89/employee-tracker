const inquirer = require("inquirer");
const mysql = require("mysql2");
require("dotenv").config();
const db = require("../connections.js");

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
      "UPDATE AN EMPLOYEE ROLE",
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

const startTracker = function () {
  inquirer.prompt(ui).then((data) => {
    console.log(data.response);
    switch (data.response) {
      case "VIEW All DEPARTMENTS":
        viewAllDepartments(data.response);
        break;
      case "VIEW ALL ROLES":
        viewAllRoles();
        break;
      case "VIEW ALL EMPLOYEES":
        viewAllEmployees();
        break;
      case "ADD A DEPARTMENT":
        addDepartment();
        break;
      case "ADD A ROLE":
        addRole();
        break;
      case "ADD AN EMPLOYEE":
        addEmployee();
        break;
      case "UPDATE AN EMPLOYEE ROLE":
        updateEmployeeRole();
        break;
      //   case "UPDATE AN EMPLOYEE'S MANGER":
      //     updateEmployeeManager();
      //     break;
      //   case "VIEW EMPLOYEES BY MANGER":
      //     viewEmployeeByManager();
      //     break;
      //   case "VIEW EMPLOYEES BY DEPARTMENT":
      //     viewEmployeeByDepartment();
      //     break;
      //   case "DELETE DEPARTMENT":
      //     deleteDepartment();
      //     break;
      //   case "DELETE ROLE":
      //     deleteRole();
      //     break;
      //   case "DELETE EMPLOYEE":
      //     deleteEmployee();
      //     break;
      //   case "VIEW DEPARTMENT BUDGETS":
      //     viewDepartmentBudgets();
      //     break;
    }
  });
};

const viewAllDepartments = function () {
  console.clear();
  console.log("Viewing all departments:");
  db.promise()
    .query("SELECT * FROM department")
    .then(([results]) => {
      console.table(results);
      return startTracker();
    })
    .catch((err) => {
      console.error("Error querying departments", err);
      return startTracker;
    });
};

const viewAllRoles = function () {
  console.clear();
  console.log("Viewing all roles:");
  db.query(
    "SELECT role.id AS 'Role ID', role.title AS 'Title', role.salary AS 'Salary', department.name AS 'Department' FROM role JOIN department ON role.department_id = department.id",
    (error, results) => {
      if (error) {
        console.error("Error querying roles: " + error.stack);
        return;
      }
      console.table(results);
      return startTracker();
    }
  );
};

const viewAllEmployees = function () {
  console.clear();
  console.log("Viewing all employees:");
  db.query(
    "SELECT employee.id AS 'Employee ID', employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS 'Job Title', department.name AS 'Department', CONCAT(manager.first_name, ' ', manager.last_name) AS 'Manager', role.salary AS 'Salary' FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id;",
    (error, results) => {
      if (error) {
        console.error("Error querying roles: " + error.stack);
        return;
      }
      console.table(results);
      return startTracker();
    }
  );
};

const addDepartment = function () {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the new department?",
        name: "department",
      },
    ])
    .then((data) => {
      console.log("Adding a department:");
      db.query(
        "INSERT INTO department (name) VALUES (?)",
        [data.department],
        (error) => {
          if (error) {
            console.error("Error querying roles");
            return startTracker();
          }
          console.log(`Created department ${data.department}`);
          return viewAllDepartments();
        }
      );
    });
};

const addRole = function () {
  console.log("Adding a role:");
  let departments = [];
  db.promise()
    .query("SELECT * FROM department")
    .then(([result]) => {
      departments = result.map(({ name, id }) => ({ name: name, id: id }));
      return inquirer.prompt([
        {
          type: "input",
          message: "What is the name of the new role?",
          name: "role",
        },
        {
          type: "Number",
          message: "What is the salary of the new role?",
          name: "salary",
        },
        {
          type: "list",
          message: "What is the department for the new role?",
          choices: departments,
          name: "department",
        },
      ]);
    })
    .then((data) => {
      const departmentId = departments.find(
        (department) => department.name === data.department
      ).id;
      console.log(departments);
      console.log("Adding a role:");
      return db
        .promise()
        .query(
          "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
          [data.role, data.salary, departmentId]
        );
    })
    .then(() => {
      console.error("Error querying roles");
      return viewAllRoles();
    })
    .catch((error) => {
      console.error("Error querying roles: " + error.stack);
      return startTracker();
    });
};

const addEmployee = function () {
  let roles = [];
  let managers = [];
  db.promise()
    .query("SELECT * FROM role")
    .then(([result]) => {
      roles = result.map(({ title, id }) => ({ name: title, id: id }));
      return db.promise().query("Select * FROM employee");
    })
    .then(([result]) => {
      managers = result.map(({ first_name, last_name, id }) => ({
        name: `${first_name} ${last_name}`,
        id: id,
      }));
      return inquirer.prompt([
        {
          type: "input",
          message: "What is the employee's first name?",
          name: "firstName",
        },
        {
          type: "input",
          message: "What is the employee's last name?",
          name: "lastName",
        },
        {
          type: "list",
          message: "What is the employee's role?",
          choices: roles,
          name: "role",
        },
        {
          type: "list",
          message: "Who is the employee's manager?",
          choices: managers,
          name: "manager",
        },
      ]);
    })
    .then((data) => {
      const roleId = roles.find((data) => roles.name === data.role).id;
      const managerId = managers.find(
        (data) => managers.name === data.manager
      ).id;
      return db
        .promise()
        .query(
          "INSERT INTO employee (first_name, employee.last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
          [data.firstName, data.lastName, roleId, managerId]
        );
    })
    .then(() => {
      console.error("Error querying roles");
      return viewAllEmployees();
    })
    .catch((error) => {
      console.error("Error querying employees: " + error.stack);
      return startTracker();
    });
};

const updateEmployeeRole = function () {
  let employees = [];
  let roles = [];
  db.promise()
    .query("SELECT * FROM role")
    .then(([result]) => {
      roles = result.map(({ title, id }) => ({ name: title, id: id }));
      return db
        .promise()
        .query("Select * FROM employee")
        .then(([result]) => {
          employees = result.map(({ first_name, last_name, id }) => ({
            name: `${first_name} ${last_name}`,
            id: id,
          }));
          console.log(employees);
          return inquirer.prompt([
            {
              type: "list",
              message: "Which employee are you updating?",
              choices: employees,
              name: "employee",
            },
            {
              type: "list",
              message: "What is the employee's new role?",
              choices: roles,
              name: "role",
            },
          ]);
        })
        .then((data) => {
          const roleId = roles.find((data) => roles.name === data.role).id;
          const employeeId = employees.find(
            (data) => managers.name === data.manager
          ).id;
          return db
            .promise()
            .query(
              "INSERT INTO employee (first_name, employee.last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
              [data.firstName, data.lastName, roleId, managerId]
            );
        });
    });
};
// updateManager()
// viewByManager()
// viewByDepartment()
// deleteDepartment()
// deleteRole()
// deleteEmployee()
// viewDepartmentBudget()

module.exports = startTracker;
