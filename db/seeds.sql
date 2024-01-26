INSERT INTO department (name)
VALUES 
('Administration'),
('Sales'),
('Accounting'),
('Quality Control'),
('Customer Service'),
('Supplier Relations');

INSERT INTO role (title, salary, department_id)
VALUES 
('Regional Manager', 75000, 1),
('Receptionist', 30000, 1),
('Asst. to the Regional Manager', 65000, 1),
('Sales Manager', 65000, 2),
('Senior Salesman', 60000, 2),
('Junior Salesman', 35000, 2),
('Accounting Manager', 60000, 3),
('Senior Accountant', 50000, 3),
('Junior Accountant', 40000, 3),
('Quality Control Manager', 45000,4),
('Customer Service Rep', 40000, 5),
('Supplier Relations', 38500, 6);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Michael', 'Scott', 1, NULL),
('Pam', 'Beesly', 2, 1),
('Dwight', 'Schrute', 3, 1),
('Jim', 'Halpert', 4, 1),
('Stanley', 'Hudson', 5, 4),
('Phyllis', 'Vance', 6, 4),
('Angela', 'Martin', 7, 1),
('Oscar', 'Martinez', 8, 7),
('Kevin', 'Malone', 9, 7),
('Creed', 'Bratton', 10, 1),
('Kelly', 'Kapoor', 11, 1),
('Meredith', 'Palmer', 12, 1);
