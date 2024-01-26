//Require inquirer to use user prompts
const inquirer = require("inquirer");
//Require connections.js to connect to mysql database
const db = require("../connections.js");

//Create user interface menu for employee tracker
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
      "UPDATE AN EMPLOYEE'S MANGER",
      "VIEW EMPLOYEES BY MANGER",
      "VIEW EMPLOYEES BY DEPARTMENT",
      "DELETE DEPARTMENT",
      "DELETE ROLE",
      "DELETE EMPLOYEE",
      "VIEW DEPARTMENT BUDGETS",
    ],
  },
];

//Create employee tracker, that takes user response on the menu and calls the appropriate function
const employeeTracker = function () {
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
      case "UPDATE AN EMPLOYEE'S MANGER":
        updateEmployeeManager();
        break;
      case "VIEW EMPLOYEES BY MANGER":
        viewEmployeeByManager();
        break;
      case "VIEW EMPLOYEES BY DEPARTMENT":
        viewEmployeeByDepartment();
        break;
      case "DELETE DEPARTMENT":
        deleteDepartment();
        break;
      case "DELETE ROLE":
        deleteRole();
        break;
      case "DELETE EMPLOYEE":
        deleteEmployee();
        break;
      case "VIEW DEPARTMENT BUDGETS":
        viewDepartmentBudget();
        break;
    }
  });
};

//Create function for viewing all departments
const viewAllDepartments = function () {
  //Clear console for a clear user experience
  console.clear();
  //connect to database with promise so it can handle asynchronous requests
  db.promise()
  //Use mysql query to see all departments
    .query("SELECT * FROM department")
    .then(([results]) => {
      console.log("VIEWING ALL DEPARTMENTS")
      //display table of all departments
      console.table(results);
      //return the menu so additional queries can be made
      return employeeTracker();
    })
    //catch any errors and return the error to the user
    .catch((err) => {
      console.error(err);
      return employeeTracker();
    });
};

const viewAllRoles = function () {
  console.clear();
  console.log("Viewing all roles:");
  //Use query to connect roles to departments through department ID and display department name instead of department id
  db.query(
    "SELECT role.id AS 'Role ID', role.title AS 'Title', role.salary AS 'Salary', department.name AS 'Department' FROM role LEFT JOIN department ON role.department_id = department.id",
    (err, results) => {
      if (err) {
        console.error(err);
        return employeeTracker();
      }
      console.log("VIEWING ALL ROLES")
      console.table(results);
      return employeeTracker();
    }
  );
};

const viewAllEmployees = function () {
  console.clear();
  //Use query to connect employees to roles and departments through role ID and department ID
  db.query(
    "SELECT employee.id AS 'Employee ID', employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS 'Job Title', department.name AS 'Department', CONCAT(manager.first_name, ' ', manager.last_name) AS 'Manager', role.salary AS 'Salary' FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id;",
    (err, results) => {
      if (err) {
        console.error(err);
        return employeeTracker();
      }
      console.log("VIEWING ALL EMPLOYEES")
      console.table(results);
      return employeeTracker();
    }
  );
};

const addDepartment = function () {
  //Use inquirer to ask user to input new department name
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the new department?",
        name: "department",
      },
    ])
    .then((data) => {
      //Use the collected input to create a query that creates a department
      db.query(
        "INSERT INTO department (name) VALUES (?)",
        [data.department],
        (err) => {
          if (err) {
            console.error(err);
            return employeeTracker();
          }
          return viewAllDepartments();
        }
      );
    });
};

const addRole = function () {
  //Create array that the database can fill with information about departments
  let departments = [];
  //Query the database for the department table
  db.promise()
    .query("SELECT * FROM department")
    .then(([result]) => {
      //Map the table to an object that contains the name and id of each department
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
          //Use the array to create a list of choices for the user to chose from
          choices: departments,
          name: "department",
        },
      ]);
    })
    .then((data) => {
      //Use .find to find the id when department name and the users choice are the same
      const departmentId = departments.find(
        (department) => department.name === data.department
      ).id;
      return db
        .promise()
        .query(
          //use the user inputted  information to create a new role
          "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
          [data.role, data.salary, departmentId]
        );
    })
    .then(() => {
      //Return function to view all roles to see the newly created role
      return viewAllRoles();
    })
    .catch((err) => {
      console.error(err);
      return employeeTracker();
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
      //Use template literal to combine first and last name in to one 'name' column for a better user experience
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
      return viewAllEmployees();
    })
    .catch((err) => {
      console.error(err);
      return employeeTracker();
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
          const roleId = roles.find((roles) => roles.name === data.role).id;
          const employeeId = employees.find(
            (employees) => employees.name === data.employee
          ).id;
          return db
            .promise()
            .query("UPDATE employee SET role_id = ? WHERE id = ?", [
              roleId,
              employeeId,
            ]);
        })
        .then(() => {
          return viewAllEmployees();
        })
        .catch((err) => {
          console.error(err);
          return employeeTracker();
        });
    });
};

const updateEmployeeManager = function () {
  let employees = [];
  let managers = [];
  db.promise()
    .query("SELECT * FROM employee")
    .then(([result]) => {
      managers = result.map(({ first_name, last_name, id }) => ({
        name: `${first_name} ${last_name}`,
        id: id,
      }));
      return db
        .promise()
        .query("Select * FROM employee")
        .then(([result]) => {
          employees = result.map(({ first_name, last_name, id }) => ({
            name: `${first_name} ${last_name}`,
            id: id,
          }));
          return inquirer.prompt([
            {
              type: "list",
              message: "Which employee are you updating?",
              choices: employees,
              name: "employee",
            },
            {
              type: "list",
              message: "Who is the employee's new manger?",
              choices: managers,
              name: "manager",
            },
          ]);
        })
        .then((data) => {
          const managerId = managers.find(
            (managers) => managers.name === data.manager
          ).id;
          const employeeId = employees.find(
            (employees) => employees.name === data.employee
          ).id;
          return db
            .promise()
            //Use update to select employee by ID and update the manager id
            .query("UPDATE employee SET manager_id = ? WHERE id = ?", [
              managerId,
              employeeId,
            ]);
        })
        .then(() => {
          return viewAllEmployees();
        })
        .catch((err) => {
          console.error(err);
          return employeeTracker();
        });
    });
};

const viewEmployeeByManager = function () {
  let managers = [];
  db.promise()
    .query("SELECT * FROM employee")
    .then(([result]) => {
      managers = result.map(({ first_name, last_name, id }) => ({
        name: `${first_name} ${last_name}`,
        id: id,
      }));

      return inquirer.prompt([
        {
          type: "list",
          message: "Select a manager to view their employees",
          choices: managers,
          name: "manager",
        },
      ]);
    })
    .then((data) => {
      console.clear();
      console.log(`VIEWING ${data.manager}'s EMPLOYEES`)
      const managerId = managers.find(
        (manager) => manager.name === data.manager
      ).id;

      return db
        .promise()
        .query(
          "SELECT id, first_name, last_name FROM employee WHERE manager_id = ?",
          [managerId]
        );
    })
    .then(([results]) => {
      console.table(results);
      return employeeTracker();
    })
    .catch((err) => {
      console.error(err);
      return employeeTracker();
    });
};

const viewEmployeeByDepartment = function () {
  let departments = [];

  db.promise()
    .query("SELECT * FROM department")
    .then(([result]) => {
      departments = result.map(({ name, id }) => ({ name, id }));
      return inquirer.prompt([
        {
          type: "list",
          message: "Select a department to view employees",
          choices: departments,
          name: "department",
        },
      ]);
    })
    .then((data) => {
      console.clear();
      console.log(`VIEWING ${data.department} EMPLOYEES`)
      const departmentId = departments.find(
        (departments) => departments.name === data.department
      ).id;
      return db
        .promise()
        .query(
          "SELECT employee.id AS 'Employee ID', employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS 'Role' FROM employee JOIN role ON employee.role_id = role.id WHERE role.department_id = ?",
          [departmentId]
        );
    })
    .then(([results]) => {
      console.table(results);
      return employeeTracker();
    })
    .catch((err) => {
      console.error(err);
      return employeeTracker();
    });
};

const deleteDepartment = function () {
  let departments = [];

  db.promise()
    .query("SELECT * FROM department")
    .then(([result]) => {
      departments = result.map(({ name, id }) => ({ name, id }));
      return inquirer.prompt([
        {
          type: "list",
          message: "Which department do you want to delete?",
          choices: departments,
          name: "department",
        },
      ]);
    })
    .then((data) => {
      const departmentId = departments.find(
        (departments) => departments.name === data.department
      ).id;
      return db
        .promise()
        .query("DELETE FROM department WHERE id = ?", [departmentId]);
    })
    .then(([results]) => {
      return viewAllDepartments();
    })
    .catch((err) => {
      console.error(err);
      return employeeTracker();
    });
};

const deleteRole = function () {
  let roles = [];

  db.promise()
    .query("SELECT * FROM role")
    .then(([result]) => {
      roles = result.map(({ title, id }) => ({ name: title, id: id }));
      return inquirer.prompt([
        {
          type: "list",
          message: "Which role do you want to delete?",
          choices: roles,
          name: "role",
        },
      ]);
    })
    .then((data) => {
      const roleId = roles.find((roles) => roles.name === data.role).id;
      //Use DELETE to target the selected role for deletion
      return db.promise().query("DELETE FROM role WHERE id = ?", [roleId]);
    })
    .then(([results]) => {
      return viewAllRoles();
    })
    .catch((err) => {
      console.error(err);
      return employeeTracker();
    });
};

const deleteEmployee = function () {
  let employees = [];

  db.promise()
    .query("SELECT * FROM employee")
    .then(([result]) => {
      employees = result.map(({ first_name, last_name, id }) => ({
        name: `${first_name} ${last_name}`,
        id: id,
      }));
      return inquirer.prompt([
        {
          type: "list",
          message: "Which employee do you want to delete?",
          choices: employees,
          name: "employee",
        },
      ]);
    })
    .then((data) => {
      const employeeId = employees.find(
        (employees) => employees.name === data.employee
      ).id;
      return db
        .promise()
        .query("DELETE FROM employee WHERE id = ?", [employeeId]);
    })
    .then(([results]) => {
      return viewAllEmployees();
    })
    .catch((err) => {
      console.error(err);
      return employeeTracker();
    });
};

const viewDepartmentBudget = function () {
  let departments = [];

  db.promise()
    .query("SELECT * FROM department")
    .then(([result]) => {
      departments = result.map(({ name, id }) => ({ name, id }));
      return inquirer.prompt([
        {
          type: "list",
          message: "Which department budget do you want to see?",
          choices: departments,
          name: "department",
        },
      ]);
    })
    .then((data) => {
      console.clear();
      console.log(`VIEWING ${data.department} BUDGET`)
      const departmentId = departments.find(
        (departments) => departments.name === data.department
      ).id;
      return db
        .promise()
        .query(
          //Use SUM to all the salaries from the selected department
          "SELECT SUM(role.salary) AS 'Budget' FROM role WHERE role.department_id = ?",
          [departmentId]
        );
    })
    .then(([result]) => {
      console.table(result);
      return employeeTracker();
    })
    .catch((err) => {
      console.error(err);
      return employeeTracker();
    });
};

module.exports = employeeTracker;
