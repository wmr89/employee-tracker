-- Delete any existing database of the same name 
DROP DATABASE IF EXISTS employeeTracker_db;
-- Create database for tracking employees
CREATE DATABASE employeeTracker_db;

-- Tell mysql to use the employee tracker database 
USE employeeTracker_db;


-- Create table for storing departments in the database 
CREATE TABLE department (
    -- create ID that is automatically created and incremented
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

-- Create table for storing roles in the database
CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT,
    -- set foreign key to connect role and department tables 
    FOREIGN KEY (department_id)
    REFERENCES department(id)
    ON DELETE SET NULL
);

-- Create table for storing employees in the database
CREATE TABLE employee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT,
    -- set foreign key to connect role and employee tables 
    FOREIGN KEY (role_id)
    REFERENCES role(id)
    ON DELETE SET NULL,
    -- set foreign key to connect employee to manager's employee ID
    FOREIGN KEY (manager_id)
    REFERENCES employee(id)
    ON DELETE SET NULL
);